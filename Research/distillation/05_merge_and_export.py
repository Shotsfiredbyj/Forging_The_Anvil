#!/usr/bin/env python3
"""
Step 5: Merge LoRA adapters and export for Ollama deployment.

Steps:
1. Load base model + LoRA adapters
2. Merge adapters into base weights
3. Save merged model in HF format
4. Convert to GGUF via llama.cpp
5. Create Ollama Modelfile
6. (Optional) Load into Ollama

Usage:
    # Standard merge + export
    python 05_merge_and_export.py \
        --base Qwen/Qwen3.5-235B-A22B \
        --adapter checkpoints/qwen35_122b_sft_20260327_* \
        --output merged/qwen35_122b_distilled \
        --quantize q5_k_m \
        --ollama-name qwen35-122b-distilled

    # HF format only (skip GGUF — useful when llama.cpp not installed)
    python 05_merge_and_export.py \
        --base Qwen/Qwen3.5-235B-A22B \
        --adapter checkpoints/qwen35_122b_sft_20260327_* \
        --output merged/qwen35_122b_distilled \
        --skip-gguf

Requires:
    pip install transformers peft torch
    llama.cpp (for GGUF conversion, optional)
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import torch
import yaml
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

SCRIPT_DIR = Path(__file__).resolve().parent
CONFIG = yaml.safe_load((SCRIPT_DIR / "config.yaml").read_text())


def merge_lora(base_model_id: str, adapter_path: str, output_path: str,
               hf_token: str = None):
    """Load base model + LoRA, merge, save."""
    print(f"Loading base model: {base_model_id}")
    token = hf_token or os.environ.get("HF_TOKEN")

    tokenizer = AutoTokenizer.from_pretrained(
        base_model_id, trust_remote_code=True, token=token)

    # For merge we need full precision (or at least bf16), not quantised
    model = AutoModelForCausalLM.from_pretrained(
        base_model_id,
        torch_dtype=torch.bfloat16,
        device_map="auto",
        trust_remote_code=True,
        token=token,
    )

    print(f"Loading LoRA adapters from: {adapter_path}")
    model = PeftModel.from_pretrained(model, adapter_path)

    print("Merging adapters into base model...")
    model = model.merge_and_unload()

    print(f"Saving merged model to: {output_path}")
    os.makedirs(output_path, exist_ok=True)
    model.save_pretrained(output_path)
    tokenizer.save_pretrained(output_path)

    # Copy training metrics if available
    metrics_src = Path(adapter_path) / "training_metrics.json"
    if metrics_src.exists():
        shutil.copy2(metrics_src, Path(output_path) / "training_metrics.json")

    print("Merge complete.")
    return output_path


def convert_to_gguf(model_path: str, output_path: str,
                    quantize: str = "q5_k_m"):
    """Convert HF model to GGUF format via llama.cpp."""
    gguf_dir = Path(output_path)
    gguf_dir.mkdir(parents=True, exist_ok=True)

    model_name = Path(model_path).name
    fp16_path = gguf_dir / f"{model_name}-fp16.gguf"
    quant_path = gguf_dir / f"{model_name}-{quantize}.gguf"

    llama_cpp = os.environ.get("LLAMA_CPP_PATH", os.path.expanduser("~/llama.cpp"))
    convert_script = Path(llama_cpp) / "convert_hf_to_gguf.py"
    quantize_bin = Path(llama_cpp) / "build" / "bin" / "llama-quantize"

    if not convert_script.exists():
        print(f"WARNING: llama.cpp not found at {llama_cpp}")
        print(f"  Set LLAMA_CPP_PATH env var or install llama.cpp")
        print(f"  Skipping GGUF conversion — merged HF model saved at {model_path}")
        return None

    # Convert to fp16 GGUF
    print(f"Converting to GGUF fp16: {fp16_path}")
    subprocess.run([
        sys.executable, str(convert_script),
        model_path,
        "--outfile", str(fp16_path),
        "--outtype", "f16",
    ], check=True)

    # Quantize
    if quantize_bin.exists():
        print(f"Quantizing to {quantize}: {quant_path}")
        subprocess.run([
            str(quantize_bin),
            str(fp16_path),
            str(quant_path),
            quantize.upper(),
        ], check=True)

        fp16_path.unlink()
        print(f"Quantized GGUF: {quant_path}")
        return str(quant_path)
    else:
        print(f"WARNING: llama-quantize not found, keeping fp16 GGUF")
        return str(fp16_path)


def create_ollama_modelfile(gguf_path: str, output_path: str,
                            model_name: str):
    """Create an Ollama Modelfile for the distilled model."""
    modelfile_path = Path(output_path) / "Modelfile"

    # General-purpose system prompt — not health-specific
    content = f"""FROM {gguf_path}

PARAMETER temperature 0.7
PARAMETER num_ctx 32768
PARAMETER stop "<|im_end|>"
PARAMETER stop "<|endoftext|>"
"""

    modelfile_path.write_text(content)
    print(f"Modelfile written: {modelfile_path}")
    return str(modelfile_path)


def load_into_ollama(modelfile_path: str, ollama_name: str,
                     host: str = "http://annuminas:11434"):
    """Load the model into Ollama."""
    print(f"Loading into Ollama as '{ollama_name}' on {host}...")
    result = subprocess.run(
        ["ollama", "create", ollama_name, "-f", modelfile_path],
        capture_output=True, text=True,
        env={**os.environ, "OLLAMA_HOST": host},
    )
    if result.returncode == 0:
        print(f"Model loaded: {ollama_name}")
    else:
        print(f"WARNING: Ollama load failed: {result.stderr}")
        print(f"  Manual: OLLAMA_HOST={host} ollama create {ollama_name} -f {modelfile_path}")


def main():
    export_cfg = CONFIG["export"]

    parser = argparse.ArgumentParser(description="Merge LoRA and export")
    parser.add_argument("--base", required=True,
                        help="Base model HuggingFace ID")
    parser.add_argument("--adapter", required=True,
                        help="Path to LoRA adapter checkpoint")
    parser.add_argument("--output", required=True,
                        help="Output directory for merged model")
    parser.add_argument("--quantize", default=export_cfg["gguf_quantize"],
                        help=f"GGUF quantization type (default: {export_cfg['gguf_quantize']})")
    parser.add_argument("--ollama-name", default=export_cfg.get("ollama_name"),
                        help="Ollama model name")
    parser.add_argument("--ollama-host", default=export_cfg["ollama_host"],
                        help="Ollama host")
    parser.add_argument("--hf-token", default=None,
                        help="HuggingFace token for gated models")
    parser.add_argument("--skip-gguf", action="store_true",
                        help="Skip GGUF conversion (keep HF format only)")
    args = parser.parse_args()

    print(f"{'='*60}")
    print(f"Merge LoRA + Export (Distillation)")
    print(f"{'='*60}")
    print(f"Base model:  {args.base}")
    print(f"Adapter:     {args.adapter}")
    print(f"Output:      {args.output}")
    print(f"Quantize:    {args.quantize}")
    print(f"Ollama name: {args.ollama_name or '(none)'}")
    print(f"{'='*60}")

    # Step 1: Merge
    merged_path = merge_lora(args.base, args.adapter, args.output,
                             hf_token=args.hf_token)

    if args.skip_gguf:
        print(f"\nMerged model saved at: {merged_path}")
        print("Skipping GGUF conversion (--skip-gguf)")
        return

    # Step 2: Convert to GGUF
    gguf_path = convert_to_gguf(merged_path, f"{args.output}/gguf",
                                 args.quantize)

    if not gguf_path:
        return

    # Step 3: Modelfile
    modelfile = create_ollama_modelfile(gguf_path, args.output,
                                        args.ollama_name or "distilled-model")

    # Step 4: Load into Ollama
    if args.ollama_name:
        load_into_ollama(modelfile, args.ollama_name, args.ollama_host)

    print(f"\n{'='*60}")
    print(f"Export complete")
    print(f"  Merged model: {merged_path}")
    print(f"  GGUF: {gguf_path}")
    print(f"  Modelfile: {modelfile}")
    if args.ollama_name:
        print(f"  Ollama: {args.ollama_name}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
