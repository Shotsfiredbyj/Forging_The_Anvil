#!/usr/bin/env python3
"""
Step 3: Build SFT dataset from teacher completions.

Converts Claude completions into the format expected by TRL's SFTTrainer
with Qwen's chat template. Optionally includes thinking traces as part
of the training signal (reasoning distillation).

Usage:
    python 03_build_sft_dataset.py                          # Build from all completions
    python 03_build_sft_dataset.py --include-thinking        # Include reasoning traces
    python 03_build_sft_dataset.py --stats                   # Show dataset statistics
"""

import argparse
import json
import sys
from pathlib import Path

import yaml

SCRIPT_DIR = Path(__file__).resolve().parent
CONFIG = yaml.safe_load((SCRIPT_DIR / "config.yaml").read_text())
TEACHER_DIR = SCRIPT_DIR / "data" / "teacher"
OUTPUT_DIR = SCRIPT_DIR / "data" / "sft"


# ---------------------------------------------------------------------------
# Load completions
# ---------------------------------------------------------------------------

def load_completions() -> list[dict]:
    """Load all successful completions from teacher output files."""
    records = []
    for f in sorted(TEACHER_DIR.glob("completions_*.jsonl")):
        with open(f) as fh:
            for line in fh:
                if not line.strip():
                    continue
                record = json.loads(line)
                if record.get("completion"):
                    records.append(record)
    return records


# ---------------------------------------------------------------------------
# Format for Qwen chat template
# ---------------------------------------------------------------------------

def format_qwen_chat(prompt: str, response: str, thinking: str | None = None) -> str:
    """
    Format as Qwen3.5 chat template.

    Qwen uses:
        <|im_start|>system
        {system_message}<|im_end|>
        <|im_start|>user
        {user_message}<|im_end|>
        <|im_start|>assistant
        {assistant_message}<|im_end|>

    If thinking is included, it goes inside the assistant turn as a
    <think>...</think> block before the response — this is how Qwen3.5's
    native thinking format works, so the model learns to reason in its
    own format.
    """
    parts = []

    # System message — keep it minimal for general-purpose distillation
    parts.append("<|im_start|>system")
    parts.append("You are a helpful assistant.<|im_end|>")

    # User turn
    parts.append("<|im_start|>user")
    parts.append(f"{prompt}<|im_end|>")

    # Assistant turn
    parts.append("<|im_start|>assistant")
    if thinking:
        # Wrap in Qwen's native thinking tags
        parts.append(f"<think>\n{thinking}\n</think>\n{response}<|im_end|>")
    else:
        parts.append(f"{response}<|im_end|>")

    return "\n".join(parts)


def format_messages(prompt: str, response: str, thinking: str | None = None) -> list[dict]:
    """
    Format as messages list for TRL SFTTrainer with chat template.

    TRL's SFTTrainer can apply the tokeniser's chat template automatically
    when given messages format. This is the preferred approach as it handles
    special tokens correctly.
    """
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": prompt},
    ]

    if thinking:
        # Include thinking as part of the assistant response
        # Qwen3.5 natively supports <think> tags
        assistant_content = f"<think>\n{thinking}\n</think>\n{response}"
    else:
        assistant_content = response

    messages.append({"role": "assistant", "content": assistant_content})
    return messages


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Build SFT dataset from teacher completions")
    parser.add_argument("--include-thinking", action="store_true",
                        help="Include reasoning traces in training data")
    parser.add_argument("--format", choices=["messages", "text"], default="messages",
                        help="Output format: 'messages' (recommended for TRL) or 'text' (pre-formatted)")
    parser.add_argument("--output", type=Path, default=None,
                        help="Output file path")
    parser.add_argument("--stats", action="store_true",
                        help="Show statistics only")
    args = parser.parse_args()

    # Load completions
    completions = load_completions()
    if not completions:
        print("Error: No completions found in data/teacher/")
        print("  Run 02_generate_teacher.py first.")
        sys.exit(1)

    print(f"Loaded {len(completions)} completions")

    # Count thinking traces available
    with_thinking = sum(1 for c in completions if c.get("thinking"))
    print(f"  With thinking traces: {with_thinking}")
    print(f"  Without thinking: {len(completions) - with_thinking}")

    if args.stats:
        # Show detailed stats
        from collections import Counter
        print(f"\nBy tier: {dict(Counter(c.get('tier') for c in completions))}")
        print(f"By category: {dict(Counter(c.get('category') for c in completions))}")
        print(f"By model: {dict(Counter(c.get('model') for c in completions))}")

        lengths = [len(c["completion"]) for c in completions]
        print(f"\nCompletion length (chars):")
        print(f"  min: {min(lengths)}, median: {sorted(lengths)[len(lengths)//2]}, max: {max(lengths)}")

        if with_thinking:
            think_lengths = [len(c["thinking"]) for c in completions if c.get("thinking")]
            print(f"\nThinking length (chars):")
            print(f"  min: {min(think_lengths)}, median: {sorted(think_lengths)[len(think_lengths)//2]}, max: {max(think_lengths)}")

        total_cost = sum(c.get("cost_usd", 0) for c in completions)
        print(f"\nTotal API cost: ${total_cost:.2f}")
        return

    # Build dataset
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    suffix = "_with_thinking" if args.include_thinking else ""
    output_file = args.output or OUTPUT_DIR / f"sft_dataset{suffix}.jsonl"

    dataset = []
    skipped = 0

    for record in completions:
        prompt = record["prompt"]
        completion = record["completion"]
        thinking = record.get("thinking") if args.include_thinking else None

        # Skip if completion is too short (likely an error or truncation)
        if len(completion) < 50:
            skipped += 1
            continue

        if args.format == "messages":
            messages = format_messages(prompt, completion, thinking)
            entry = {
                "messages": messages,
                "metadata": {
                    "source_model": record.get("model"),
                    "tier": record.get("tier"),
                    "category": record.get("category"),
                    "source": record.get("source"),
                    "cost_usd": record.get("cost_usd"),
                },
            }
        else:
            text = format_qwen_chat(prompt, completion, thinking)
            entry = {
                "text": text,
                "metadata": {
                    "source_model": record.get("model"),
                    "tier": record.get("tier"),
                    "category": record.get("category"),
                },
            }

        dataset.append(entry)

    # Write output
    with open(output_file, "w") as f:
        for entry in dataset:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"\nDataset written: {len(dataset)} examples to {output_file}")
    if skipped:
        print(f"  Skipped {skipped} entries with short completions")

    # Estimate tokens for training time prediction
    if args.format == "messages":
        total_chars = sum(
            sum(len(m["content"]) for m in e["messages"])
            for e in dataset
        )
    else:
        total_chars = sum(len(e["text"]) for e in dataset)

    est_tokens = total_chars / 4
    print(f"  Estimated total tokens: {est_tokens:,.0f}")
    print(f"  At 2 epochs: ~{est_tokens * 2:,.0f} training tokens")


if __name__ == "__main__":
    main()
