#!/usr/bin/env python3
"""
Step 2: Generate teacher completions from Claude Opus/Sonnet.

Reads the curated prompt set and generates completions using the Anthropic API.
Supports prompt caching, extended thinking, resume, and cost tracking.

Usage:
    python 02_generate_teacher.py                           # Run all tiers
    python 02_generate_teacher.py --tier hard               # Run only hard tier (Opus)
    python 02_generate_teacher.py --tier medium --resume     # Resume medium tier
    python 02_generate_teacher.py --dry-run                  # Show cost estimate only
    python 02_generate_teacher.py --cost-report              # Report on existing completions

Requires:
    pip install anthropic pyyaml
    export ANTHROPIC_API_KEY=sk-ant-...
"""

import argparse
import asyncio
import json
import os
import sys
import time
from collections import Counter
from datetime import datetime
from pathlib import Path

import yaml

SCRIPT_DIR = Path(__file__).resolve().parent
CONFIG = yaml.safe_load((SCRIPT_DIR / "config.yaml").read_text())
TEACHER_CFG = CONFIG["teacher"]
OUTPUT_DIR = SCRIPT_DIR / "data" / "teacher"

# Pricing per million tokens (as of 2026-03)
PRICING = {
    "claude-opus-4-6": {"input": 15.0, "output": 75.0, "cache_read": 1.5, "thinking": 15.0},
    "claude-sonnet-4-6": {"input": 3.0, "output": 15.0, "cache_read": 0.3, "thinking": 3.0},
}

# System prompt — cached across all requests
SYSTEM_PROMPT = """You are a highly capable AI assistant. Respond thoughtfully and thoroughly.

When reasoning through problems:
- Think step by step
- Consider multiple angles and trade-offs
- Be direct and specific — avoid filler
- If you're uncertain, say so

When writing code:
- Write clean, idiomatic code
- Explain your reasoning
- Consider edge cases

When analysing or designing:
- Start with the core problem
- Break it down into components
- Consider constraints and trade-offs
- Be opinionated — commit to a recommendation"""


# ---------------------------------------------------------------------------
# Anthropic client setup
# ---------------------------------------------------------------------------

def _load_dotenv():
    """Load .env file from script directory if it exists."""
    env_file = SCRIPT_DIR / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                os.environ.setdefault(key.strip(), value.strip())


def get_client():
    """Get Anthropic async client."""
    _load_dotenv()

    try:
        import anthropic
    except ImportError:
        print("Error: anthropic SDK not installed.")
        print("  pip install anthropic")
        sys.exit(1)

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY not set.")
        sys.exit(1)

    return anthropic.AsyncAnthropic(api_key=api_key)


# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------

async def generate_completion(
    client,
    prompt: dict,
    tier_config: dict,
    semaphore: asyncio.Semaphore,
) -> dict | None:
    """Generate a single teacher completion."""
    model = tier_config["model"]
    max_tokens = tier_config["max_tokens"]
    temperature = tier_config.get("temperature", 0.7)
    use_thinking = TEACHER_CFG.get("extended_thinking", False)
    thinking_budget = TEACHER_CFG.get("thinking_budget", 10000)

    async with semaphore:
        start = time.time()

        try:
            kwargs = {
                "model": model,
                "max_tokens": max_tokens + (thinking_budget if use_thinking else 0),
                "system": [
                    {
                        "type": "text",
                        "text": SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},
                    }
                ] if TEACHER_CFG.get("prompt_caching") else SYSTEM_PROMPT,
                "messages": [{"role": "user", "content": prompt["text"]}],
            }

            # Extended thinking for supported models
            if use_thinking and "opus" in model:
                kwargs["thinking"] = {
                    "type": "enabled",
                    "budget_tokens": thinking_budget,
                }
                # Temperature must be 1 with extended thinking
                kwargs["temperature"] = 1
            else:
                kwargs["temperature"] = temperature

            # Use streaming to avoid timeout on long thinking requests
            async with client.messages.stream(**kwargs) as stream:
                final_message = await stream.get_final_message()
            elapsed = time.time() - start

            # Extract content
            thinking_text = ""
            response_text = ""

            for block in final_message.content:
                if block.type == "thinking":
                    thinking_text = block.thinking
                elif block.type == "text":
                    response_text = block.text

            # Token usage
            usage = final_message.usage
            input_tokens = usage.input_tokens
            output_tokens = usage.output_tokens
            cache_read = getattr(usage, "cache_read_input_tokens", 0) or 0
            cache_creation = getattr(usage, "cache_creation_input_tokens", 0) or 0

            # Cost calculation
            pricing = PRICING.get(model, PRICING.get("claude-sonnet-4-6"))
            input_cost = (input_tokens - cache_read) * pricing["input"] / 1_000_000
            cache_cost = cache_read * pricing["cache_read"] / 1_000_000
            output_cost = output_tokens * pricing["output"] / 1_000_000
            total_cost = input_cost + cache_cost + output_cost

            return {
                "prompt": prompt["text"],
                "completion": response_text,
                "thinking": thinking_text if thinking_text else None,
                "model": model,
                "tier": prompt.get("tier", "unknown"),
                "category": prompt.get("category", "unknown"),
                "source": prompt.get("source", "unknown"),
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "cache_read_tokens": cache_read,
                "cache_creation_tokens": cache_creation,
                "cost_usd": round(total_cost, 6),
                "elapsed_seconds": round(elapsed, 2),
                "timestamp": datetime.now(tz=__import__('datetime').timezone.utc).isoformat(),
                "stop_reason": final_message.stop_reason,
            }

        except Exception as e:
            elapsed = time.time() - start
            error_type = type(e).__name__

            # Rate limit — back off
            if "rate_limit" in str(e).lower() or "429" in str(e):
                wait = 30
                print(f"  Rate limited. Waiting {wait}s...")
                await asyncio.sleep(wait)
                # Retry once
                return await generate_completion(client, prompt, tier_config, semaphore)

            print(f"  Error ({error_type}): {str(e)[:200]}")
            return {
                "prompt": prompt["text"],
                "completion": None,
                "error": f"{error_type}: {str(e)[:500]}",
                "model": model,
                "tier": prompt.get("tier", "unknown"),
                "elapsed_seconds": round(elapsed, 2),
                "timestamp": datetime.now(tz=__import__('datetime').timezone.utc).isoformat(),
            }


async def run_tier(
    client,
    prompts: list[dict],
    tier_name: str,
    tier_config: dict,
    output_file: Path,
    resume: bool = False,
):
    """Run generation for a single tier."""
    max_concurrent = TEACHER_CFG.get("max_concurrent", 5)
    semaphore = asyncio.Semaphore(max_concurrent)

    # Resume: load existing completions and skip already-done prompts
    done_prompts = set()
    existing_records = []
    if resume and output_file.exists():
        with open(output_file) as f:
            for line in f:
                record = json.loads(line)
                if record.get("completion"):
                    done_prompts.add(record["prompt"])
                    existing_records.append(record)
        print(f"  Resume: {len(done_prompts)} already completed, skipping")

    remaining = [p for p in prompts if p["text"] not in done_prompts]
    if not remaining:
        print(f"  All {len(prompts)} prompts already completed for tier '{tier_name}'")
        return existing_records

    print(f"  Generating {len(remaining)} completions with {tier_config['model']}...")
    print(f"  Max concurrent: {max_concurrent}")

    results = existing_records.copy()
    batch_size = 20  # Progress reporting interval

    for i in range(0, len(remaining), batch_size):
        batch = remaining[i : i + batch_size]
        tasks = [
            generate_completion(client, p, tier_config, semaphore)
            for p in batch
        ]
        batch_results = await asyncio.gather(*tasks)

        for result in batch_results:
            if result:
                results.append(result)
                # Append to file immediately (resume-safe)
                with open(output_file, "a") as f:
                    f.write(json.dumps(result, ensure_ascii=False) + "\n")

        # Progress
        completed = len(results) - len(existing_records)
        total = len(remaining)
        successes = sum(1 for r in batch_results if r and r.get("completion"))
        errors = sum(1 for r in batch_results if r and r.get("error"))
        batch_cost = sum(r.get("cost_usd", 0) for r in batch_results if r)
        total_cost = sum(r.get("cost_usd", 0) for r in results)

        print(
            f"  [{completed}/{total}] "
            f"batch: {successes} ok, {errors} err, ${batch_cost:.3f} | "
            f"total: ${total_cost:.2f}"
        )

        # Rate limit pacing
        rpm = TEACHER_CFG.get("requests_per_minute", 50)
        await asyncio.sleep(60 / rpm * len(batch) * 0.5)

    return results


# ---------------------------------------------------------------------------
# Cost estimation
# ---------------------------------------------------------------------------

def estimate_cost(prompts: list[dict]):
    """Estimate API cost without making any calls."""
    print(f"\n{'=' * 60}")
    print("Cost Estimate (dry run)")
    print(f"{'=' * 60}")

    use_thinking = TEACHER_CFG.get("extended_thinking", False)
    thinking_budget = TEACHER_CFG.get("thinking_budget", 10000)

    tier_groups = {}
    for p in prompts:
        tier = p.get("tier", "easy")
        tier_groups.setdefault(tier, []).append(p)

    total_cost = 0

    for tier_name, tier_prompts in sorted(tier_groups.items()):
        count = len(tier_prompts)
        tier_cfg = TEACHER_CFG["tiers"].get(tier_name, TEACHER_CFG["tiers"]["easy"])
        model = tier_cfg["model"]
        pricing = PRICING.get(model, {})

        # Use actual prompt lengths from dataset (~4 chars per token)
        avg_input = sum(len(p["text"]) for p in tier_prompts) / count / 4
        avg_output = 1200  # Realistic average response length

        input_cost = count * avg_input * pricing.get("input", 3) / 1_000_000
        output_cost = count * avg_output * pricing.get("output", 15) / 1_000_000

        # Thinking tokens (billed at thinking rate, only for Opus with thinking enabled)
        thinking_cost = 0
        if use_thinking and "opus" in model:
            # Assume average thinking usage is ~40% of budget
            avg_thinking = thinking_budget * 0.4
            thinking_cost = count * avg_thinking * pricing.get("thinking", 15) / 1_000_000

        # Prompt caching saves ~90% on system prompt input after first request
        if TEACHER_CFG.get("prompt_caching"):
            cache_savings = count * 200 * pricing.get("input", 3) * 0.9 / 1_000_000
            input_cost -= cache_savings

        tier_cost = input_cost + output_cost + thinking_cost
        total_cost += tier_cost

        print(f"\n  {tier_name} ({count} prompts, {model}):")
        print(f"    Avg input tokens:   ~{avg_input:.0f}")
        print(f"    Est. input cost:    ${input_cost:.2f}")
        print(f"    Est. output cost:   ${output_cost:.2f}")
        if thinking_cost > 0:
            print(f"    Est. thinking cost: ${thinking_cost:.2f}")
        print(f"    Est. tier total:    ${tier_cost:.2f}")

    print(f"\n  ESTIMATED TOTAL: ${total_cost:.2f}")
    if use_thinking:
        print(f"  (includes extended thinking @ {thinking_budget} budget)")
        print(f"  Without thinking: run with extended_thinking: false in config")
    print(f"{'=' * 60}")


# ---------------------------------------------------------------------------
# Cost report
# ---------------------------------------------------------------------------

def cost_report():
    """Report costs from existing completion files."""
    print(f"\n{'=' * 60}")
    print("Cost Report")
    print(f"{'=' * 60}")

    total_cost = 0
    total_tokens_in = 0
    total_tokens_out = 0
    total_completions = 0
    total_errors = 0

    for output_file in sorted(OUTPUT_DIR.glob("*.jsonl")):
        records = [json.loads(line) for line in output_file.read_text().splitlines() if line.strip()]
        if not records:
            continue

        successes = [r for r in records if r.get("completion")]
        errors = [r for r in records if r.get("error")]
        cost = sum(r.get("cost_usd", 0) for r in records)
        tokens_in = sum(r.get("input_tokens", 0) for r in records)
        tokens_out = sum(r.get("output_tokens", 0) for r in records)

        print(f"\n  {output_file.name}:")
        print(f"    Completions: {len(successes)}, Errors: {len(errors)}")
        print(f"    Tokens: {tokens_in:,} in, {tokens_out:,} out")
        print(f"    Cost: ${cost:.2f}")

        total_cost += cost
        total_tokens_in += tokens_in
        total_tokens_out += tokens_out
        total_completions += len(successes)
        total_errors += len(errors)

    print(f"\n  TOTAL: {total_completions} completions, {total_errors} errors")
    print(f"  TOTAL TOKENS: {total_tokens_in:,} in, {total_tokens_out:,} out")
    print(f"  TOTAL COST: ${total_cost:.2f}")
    print(f"{'=' * 60}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def async_main(args):
    """Async entry point."""
    prompts_file = SCRIPT_DIR / "data" / "prompts" / "curated_prompts.jsonl"
    if not prompts_file.exists():
        print(f"Error: No curated prompts found at {prompts_file}")
        print("  Run 01_curate_prompts.py first.")
        sys.exit(1)

    prompts = [json.loads(line) for line in prompts_file.read_text().splitlines() if line.strip()]
    print(f"Loaded {len(prompts)} curated prompts")

    # Filter by tier if specified
    tiers_to_run = (
        [args.tier] if args.tier
        else list(TEACHER_CFG["tiers"].keys())
    )

    # Dry run: just estimate
    if args.dry_run:
        estimate_cost(prompts)
        return

    client = get_client()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    for tier_name in tiers_to_run:
        tier_config = TEACHER_CFG["tiers"].get(tier_name)
        if not tier_config:
            print(f"Unknown tier: {tier_name}")
            continue

        tier_prompts = [p for p in prompts if p.get("tier") == tier_name]
        if not tier_prompts:
            print(f"\nNo prompts assigned to tier '{tier_name}', skipping")
            continue

        # Output file per tier (allows resume per tier)
        output_file = OUTPUT_DIR / f"completions_{tier_name}_{timestamp}.jsonl"
        if args.resume:
            # Find latest existing file for this tier
            existing = sorted(OUTPUT_DIR.glob(f"completions_{tier_name}_*.jsonl"))
            if existing:
                output_file = existing[-1]

        print(f"\n{'=' * 60}")
        print(f"Tier: {tier_name} ({len(tier_prompts)} prompts)")
        print(f"Model: {tier_config['model']}")
        print(f"Output: {output_file}")
        print(f"{'=' * 60}")

        results = await run_tier(
            client, tier_prompts, tier_name, tier_config, output_file, args.resume
        )

        successes = sum(1 for r in results if r.get("completion"))
        errors = sum(1 for r in results if r.get("error"))
        cost = sum(r.get("cost_usd", 0) for r in results)
        print(f"\n  Tier '{tier_name}' complete: {successes} ok, {errors} errors, ${cost:.2f}")


def main():
    parser = argparse.ArgumentParser(description="Generate teacher completions")
    parser.add_argument("--tier", choices=["hard", "medium", "easy"],
                        help="Run only this tier")
    parser.add_argument("--resume", action="store_true",
                        help="Resume from last checkpoint")
    parser.add_argument("--dry-run", action="store_true",
                        help="Estimate cost without generating")
    parser.add_argument("--cost-report", action="store_true",
                        help="Report costs from existing completions")
    args = parser.parse_args()

    if args.cost_report:
        cost_report()
        return

    asyncio.run(async_main(args))


if __name__ == "__main__":
    main()
