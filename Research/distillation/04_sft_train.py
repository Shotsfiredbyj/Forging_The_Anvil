#!/usr/bin/env python3
"""
Step 4: QLoRA SFT training for distillation.

Trains Qwen3.5 122B (MoE) to reproduce Claude Opus reasoning patterns
using SFT on teacher completions. Loads ONE copy of the model (not two
like DPO), so it fits in ~70-75GB — feasible on 96GB local GPU.

Usage:
    # Local on Annuminas (96GB) — conservative settings
    python 04_sft_train.py \
        --model Qwen/Qwen3.5-235B-A22B \
        --dataset data/sft/sft_dataset.jsonl \
        --output checkpoints/qwen35_122b_sft

    # Override batch/sequence settings
    python 04_sft_train.py \
        --model Qwen/Qwen3.5-235B-A22B \
        --dataset data/sft/sft_dataset.jsonl \
        --output checkpoints/qwen35_122b_sft \
        --batch-size 1 --grad-accum 8 --max-length 1536

    # Test with 10 examples first (VRAM check)
    python 04_sft_train.py \
        --model Qwen/Qwen3.5-235B-A22B \
        --dataset data/sft/sft_dataset.jsonl \
        --output checkpoints/test_vram \
        --max-samples 10 --epochs 1

    # RunPod 2xB200 — can use larger batch
    python 04_sft_train.py \
        --model Qwen/Qwen3.5-235B-A22B \
        --dataset data/sft/sft_dataset.jsonl \
        --output checkpoints/qwen35_122b_sft \
        --batch-size 2 --grad-accum 4

    # fp16 mode (for GPUs where bitsandbytes segfaults)
    python 04_sft_train.py \
        --model Qwen/Qwen3.5-235B-A22B \
        --dataset data/sft/sft_dataset.jsonl \
        --output checkpoints/qwen35_122b_sft \
        --no-quantize

Requires:
    pip install transformers trl peft bitsandbytes datasets torch
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import torch
import yaml
from datasets import Dataset
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
)
from trl import SFTConfig, SFTTrainer

SCRIPT_DIR = Path(__file__).resolve().parent
CONFIG = yaml.safe_load((SCRIPT_DIR / "config.yaml").read_text())


# ---------------------------------------------------------------------------
# Dataset loading
# ---------------------------------------------------------------------------

def load_sft_dataset(path: str, max_samples: int | None = None) -> Dataset:
    """Load SFT dataset from JSONL (messages format)."""
    records = []
    with open(path) as f:
        for line in f:
            if not line.strip():
                continue
            record = json.loads(line)
            if "messages" in record:
                records.append({"messages": record["messages"]})
            elif "text" in record:
                records.append({"text": record["text"]})

    if max_samples and max_samples < len(records):
        records = records[:max_samples]

    print(f"Loaded {len(records)} training examples")
    return Dataset.from_list(records)


# ---------------------------------------------------------------------------
# Model setup
# ---------------------------------------------------------------------------

def get_quantization_config() -> BitsAndBytesConfig:
    """4-bit NF4 quantization for QLoRA."""
    cfg = CONFIG["quantization"]
    return BitsAndBytesConfig(
        load_in_4bit=cfg["load_in_4bit"],
        bnb_4bit_quant_type=cfg["quant_type"],
        bnb_4bit_compute_dtype=getattr(torch, cfg["compute_dtype"]),
        bnb_4bit_use_double_quant=cfg["double_quant"],
    )


def get_lora_config() -> LoraConfig:
    """
    LoRA config — attention-only for MoE safety.

    For MoE models, targeting all expert MLPs (gate_proj, up_proj, down_proj)
    risks destabilising the routing network since different experts learn
    conflicting adaptations. Attention layers are shared across all tokens,
    giving a consistent learning signal.
    """
    cfg = CONFIG["lora"]
    return LoraConfig(
        r=cfg["r"],
        lora_alpha=cfg["alpha"],
        lora_dropout=cfg["dropout"],
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=cfg["target_modules"],
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="QLoRA SFT training for distillation")
    parser.add_argument("--model", required=True,
                        help="HuggingFace model ID (e.g. Qwen/Qwen3.5-235B-A22B)")
    parser.add_argument("--dataset", required=True,
                        help="SFT dataset JSONL file")
    parser.add_argument("--output", required=True,
                        help="Output directory for LoRA checkpoints")
    parser.add_argument("--batch-size", type=int,
                        default=CONFIG["model"]["profiles"]["local"]["batch_size"],
                        help="Per-device batch size")
    parser.add_argument("--grad-accum", type=int,
                        default=CONFIG["model"]["profiles"]["local"]["grad_accum"],
                        help="Gradient accumulation steps")
    parser.add_argument("--epochs", type=int,
                        default=CONFIG["sft"]["epochs"],
                        help="Number of training epochs")
    parser.add_argument("--lr", type=float,
                        default=CONFIG["sft"]["learning_rate"],
                        help="Learning rate")
    parser.add_argument("--max-length", type=int,
                        default=CONFIG["sft"]["max_length"],
                        help="Max sequence length")
    parser.add_argument("--max-samples", type=int, default=None,
                        help="Limit dataset size (for VRAM testing)")
    parser.add_argument("--hf-token", type=str, default=None,
                        help="HuggingFace token for gated models")
    parser.add_argument("--no-quantize", action="store_true",
                        help="Load in fp16 instead of 4-bit")
    args = parser.parse_args()

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = f"{args.output}_{timestamp}"

    lora_cfg = CONFIG["lora"]
    effective_batch = args.batch_size * args.grad_accum

    print(f"{'='*60}")
    print(f"QLoRA SFT Training (Distillation)")
    print(f"{'='*60}")
    print(f"Model:       {args.model}")
    print(f"Dataset:     {args.dataset}")
    print(f"Output:      {output_dir}")
    print(f"Batch size:  {args.batch_size} x {args.grad_accum} grad accum = {effective_batch} effective")
    print(f"Epochs:      {args.epochs}")
    print(f"LR:          {args.lr}")
    print(f"Max length:  {args.max_length}")
    print(f"LoRA:        r={lora_cfg['r']}, alpha={lora_cfg['alpha']}, targets={lora_cfg['target_modules']}")
    print(f"Quantize:    {'no (fp16)' if args.no_quantize else '4-bit NF4'}")
    if args.max_samples:
        print(f"Max samples: {args.max_samples} (VRAM test mode)")
    print(f"{'='*60}")

    # Load dataset
    dataset = load_sft_dataset(args.dataset, args.max_samples)
    if len(dataset) == 0:
        print("ERROR: No training examples loaded.")
        sys.exit(1)

    # Load tokenizer
    token = args.hf_token or os.environ.get("HF_TOKEN")
    tokenizer = AutoTokenizer.from_pretrained(
        args.model,
        trust_remote_code=True,
        token=token,
    )
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Load model
    if args.no_quantize:
        print(f"\nLoading model in fp16 (no quantization)...")
        model = AutoModelForCausalLM.from_pretrained(
            args.model,
            device_map="auto",
            trust_remote_code=True,
            torch_dtype=torch.bfloat16,
            attn_implementation="sdpa",
            token=token,
        )
    else:
        print(f"\nLoading model in 4-bit NF4...")
        quant_config = get_quantization_config()
        model = AutoModelForCausalLM.from_pretrained(
            args.model,
            quantization_config=quant_config,
            device_map="auto",
            trust_remote_code=True,
            torch_dtype=torch.bfloat16,
            attn_implementation="sdpa",
            token=token,
        )
        # Skip prepare_model_for_kbit_training — it tries to convert
        # params to float32 which OOMs on large models. Modern peft/trl
        # handles this automatically with gradient_checkpointing.
        model.gradient_checkpointing_enable(gradient_checkpointing_kwargs={"use_reentrant": False})

    # VRAM checkpoint after model load
    if torch.cuda.is_available():
        allocated = torch.cuda.memory_allocated() / 1e9
        reserved = torch.cuda.memory_reserved() / 1e9
        print(f"\nVRAM after model load: {allocated:.1f}GB allocated, {reserved:.1f}GB reserved")

    # Apply LoRA
    lora_config = get_lora_config()
    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    # VRAM checkpoint after LoRA
    if torch.cuda.is_available():
        allocated = torch.cuda.memory_allocated() / 1e9
        print(f"VRAM after LoRA: {allocated:.1f}GB allocated")

    # SFT training config
    sft_cfg = CONFIG["sft"]
    training_args = SFTConfig(
        output_dir=output_dir,
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        learning_rate=args.lr,
        max_length=args.max_length,
        bf16=sft_cfg["bf16"],
        logging_steps=5,
        save_steps=100,
        save_total_limit=2,
        warmup_ratio=sft_cfg["warmup_ratio"],
        optim=sft_cfg["optimizer"],
        gradient_checkpointing=sft_cfg["gradient_checkpointing"],
        gradient_checkpointing_kwargs={"use_reentrant": False},
        remove_unused_columns=False,
        report_to="none",
        dataset_text_field=None,  # Using messages format with chat template
    )

    # Create trainer
    trainer = SFTTrainer(
        model=model,
        args=training_args,
        train_dataset=dataset,
        processing_class=tokenizer,
    )

    # Train
    print(f"\nStarting SFT training...")
    print(f"  {len(dataset)} examples, {args.epochs} epochs")
    print(f"  Effective batch: {effective_batch}")
    print(f"  Total steps: ~{len(dataset) * args.epochs // effective_batch}")

    train_result = trainer.train()

    # Save
    print(f"\nSaving LoRA adapters to {output_dir}")
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)

    # Save training metrics
    metrics = train_result.metrics
    metrics["model"] = args.model
    metrics["dataset_size"] = len(dataset)
    metrics["timestamp"] = timestamp
    metrics["lora_config"] = {
        "r": lora_cfg["r"],
        "alpha": lora_cfg["alpha"],
        "target_modules": lora_cfg["target_modules"],
    }
    metrics["quantization"] = "fp16" if args.no_quantize else "4-bit NF4"

    with open(f"{output_dir}/training_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    # Final VRAM report
    if torch.cuda.is_available():
        peak = torch.cuda.max_memory_allocated() / 1e9
        print(f"\nPeak VRAM usage: {peak:.1f}GB")

    print(f"\n{'='*60}")
    print(f"Training complete")
    print(f"  Loss: {metrics.get('train_loss', 'N/A')}")
    print(f"  Runtime: {metrics.get('train_runtime', 0):.0f}s")
    print(f"  Peak VRAM: {torch.cuda.max_memory_allocated() / 1e9:.1f}GB" if torch.cuda.is_available() else "")
    print(f"  Adapters: {output_dir}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
