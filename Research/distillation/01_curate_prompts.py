#!/usr/bin/env python3
"""
Step 1: Curate prompts for distillation.

Extracts user prompts from Claude Code session transcripts and supplements
with open-source datasets. Filters, deduplicates, categorises, and samples
to build the training prompt set.

Usage:
    python 01_curate_prompts.py                          # Full pipeline
    python 01_curate_prompts.py --extract-only            # Just extract from transcripts
    python 01_curate_prompts.py --stats                   # Show statistics only
"""

import argparse
import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path

import yaml

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
CONFIG = yaml.safe_load((SCRIPT_DIR / "config.yaml").read_text())

PROMPT_CFG = CONFIG["prompts"]
OUTPUT_DIR = SCRIPT_DIR / "data" / "prompts"

# Category keywords for rough classification of transcript messages
CATEGORY_KEYWORDS = {
    "code": [
        "function", "class", "import", "def ", "const ", "let ", "var ",
        "bug", "error", "fix", "test", "lint", "build", "compile",
        "refactor", "implement", "script", "endpoint", "api",
    ],
    "architecture": [
        "design", "architecture", "pattern", "system", "infrastructure",
        "pipeline", "service", "gateway", "routing", "fleet",
        "scalab", "trade-off", "tradeoff",
    ],
    "product": [
        "user", "feature", "requirement", "spec", "roadmap", "milestone",
        "pm", "product", "ux", "flow", "journey", "onboard",
    ],
    "complex_reasoning": [
        "why", "how does", "explain", "compare", "evaluate", "analyse",
        "analyze", "trade-off", "tradeoff", "pros and cons", "should we",
        "what if", "reasoning", "think through",
    ],
    "nuanced_ambiguous": [
        "opinion", "prefer", "better", "worse", "controversial",
        "depends", "subtle", "nuance", "grey area", "gray area",
    ],
    "creative": [
        "write", "story", "name", "brand", "tone", "voice", "copy",
        "draft", "rewrite", "summarise", "summarize",
    ],
    "analysis": [
        "data", "metric", "chart", "graph", "statistic", "distribution",
        "percentile", "benchmark", "eval", "score", "result",
    ],
}


# ---------------------------------------------------------------------------
# Transcript extraction (multi-turn)
# ---------------------------------------------------------------------------

def _extract_text(content: list, strip_patterns: list[re.Pattern]) -> str:
    """Extract and clean text from a message content list."""
    text_parts = []
    for part in content:
        if isinstance(part, dict) and part.get("type") == "text":
            text_parts.append(part["text"])
    text = "\n".join(text_parts).strip()
    for pattern in strip_patterns:
        text = pattern.sub("", text)
    return text.strip()


def _is_trivial(text: str, skip_patterns: list[re.Pattern], min_len: int) -> bool:
    """Check if a message is too trivial to be useful."""
    if len(text) < min_len:
        return True
    return any(p.match(text) for p in skip_patterns)


def _truncate_turn(text: str, max_chars: int = 1500) -> str:
    """Truncate a turn for context, keeping the start."""
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "\n[... truncated]"


def extract_transcripts() -> list[dict]:
    """
    Extract multi-turn conversation windows from session transcripts.

    Instead of extracting individual user messages (which are often short
    and context-dependent), this extracts conversation windows: the final
    user message plus preceding turns that give it context.

    Strategy:
    - Walk each session chronologically
    - For each user turn, decide if it's a good "anchor" for a training example
    - If the user message is substantial on its own (>100 chars), emit it solo
    - If it's short but has rich preceding context, emit a multi-turn window
      (up to 3 preceding turns: assistant response + user message pairs)
    - Skip trivial turns (approvals, yes/no, slash commands)
    """
    strip_patterns = [re.compile(p, re.DOTALL) for p in PROMPT_CFG["strip_patterns"]]
    skip_patterns = [re.compile(p, re.IGNORECASE) for p in PROMPT_CFG["skip_patterns"]]

    min_len = PROMPT_CFG["filters"]["min_length_chars"]
    max_len = PROMPT_CFG["filters"]["max_length_chars"]
    standalone_threshold = 100  # Chars needed to be a good standalone prompt

    prompts = []

    for source_dir in PROMPT_CFG["transcript_sources"]:
        source_path = Path(source_dir)
        if not source_path.exists():
            print(f"  Skipping missing: {source_path}")
            continue

        project_name = source_path.name
        jsonl_files = sorted(source_path.glob("*.jsonl"))
        extracted = 0

        for jf in jsonl_files:
            session_id = jf.stem

            # First pass: collect all turns in order
            turns = []
            with open(jf) as f:
                for line in f:
                    try:
                        record = json.loads(line)
                    except json.JSONDecodeError:
                        continue

                    rtype = record.get("type")
                    if rtype not in ("user", "assistant"):
                        continue

                    content = record.get("message", {}).get("content", [])
                    text = _extract_text(content, strip_patterns)
                    if not text:
                        continue

                    turns.append({"role": rtype, "text": text})

            # Second pass: build conversation windows anchored on user turns
            for i, turn in enumerate(turns):
                if turn["role"] != "user":
                    continue

                user_text = turn["text"]

                # Skip trivial
                if _is_trivial(user_text, skip_patterns, min_len):
                    continue
                if len(user_text) > max_len:
                    continue

                # Decide: standalone or multi-turn window?
                if len(user_text) >= standalone_threshold:
                    # Substantial enough on its own
                    prompts.append({
                        "text": user_text,
                        "source": "transcript",
                        "format": "single_turn",
                        "project": project_name,
                        "session_id": session_id,
                        "category": categorise_prompt(user_text),
                    })
                    extracted += 1
                else:
                    # Short message — needs context. Look back for preceding turns.
                    # Collect up to 4 preceding turns (2 exchanges) for context.
                    context_turns = []
                    lookback = min(4, i)
                    for j in range(i - lookback, i):
                        t = turns[j]
                        context_turns.append(t)

                    if not context_turns:
                        # No context available — skip this short message
                        continue

                    # Build the multi-turn prompt as a conversation
                    parts = []
                    for ct in context_turns:
                        role_label = "User" if ct["role"] == "user" else "Assistant"
                        parts.append(f"[{role_label}]: {_truncate_turn(ct['text'])}")
                    parts.append(f"[User]: {user_text}")

                    conversation_text = "\n\n".join(parts)

                    # Skip if combined window is still too short
                    if len(conversation_text) < 80:
                        continue
                    # Skip if combined window is too long
                    if len(conversation_text) > max_len:
                        continue

                    prompts.append({
                        "text": conversation_text,
                        "source": "transcript",
                        "format": "multi_turn",
                        "project": project_name,
                        "session_id": session_id,
                        "category": categorise_prompt(conversation_text),
                    })
                    extracted += 1

        print(f"  {project_name}: {extracted} prompts extracted from {len(jsonl_files)} sessions")

    return prompts


def categorise_prompt(text: str) -> str:
    """Rough categorisation based on keyword matching."""
    text_lower = text.lower()
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        scores[category] = sum(1 for kw in keywords if kw in text_lower)

    if not scores or max(scores.values()) == 0:
        return "general"
    return max(scores, key=scores.get)


# ---------------------------------------------------------------------------
# Open-source dataset loading
# ---------------------------------------------------------------------------

def load_open_source() -> list[dict]:
    """Load and sample from open-source prompt datasets."""
    try:
        from datasets import load_dataset
    except ImportError:
        print("  Warning: 'datasets' not installed. Skipping open-source prompts.")
        print("  Install with: pip install datasets")
        return []

    prompts = []

    for ds_cfg in PROMPT_CFG.get("open_source", []):
        dataset_name = ds_cfg["dataset"]
        target_count = ds_cfg["count"]
        categories = ds_cfg.get("categories", ["general"])

        print(f"  Loading {dataset_name} (target: {target_count})...")

        try:
            if dataset_name == "teknium/OpenHermes-2.5":
                ds = load_dataset(dataset_name, split="train", streaming=True)
                sampled = 0
                for row in ds:
                    if sampled >= target_count:
                        break
                    # OpenHermes uses 'conversations' format
                    convos = row.get("conversations", [])
                    if not convos:
                        continue
                    # Get the first human turn
                    human_turn = next(
                        (c for c in convos if c.get("from") == "human"),
                        None,
                    )
                    if not human_turn:
                        continue
                    text = human_turn.get("value", "").strip()
                    if len(text) < 20 or len(text) > 8000:
                        continue
                    prompts.append({
                        "text": text,
                        "source": "open_source",
                        "dataset": dataset_name,
                        "category": categories[sampled % len(categories)],
                    })
                    sampled += 1

                print(f"    Sampled {sampled} prompts")

            elif dataset_name == "microsoft/orca-math-word-problems-200k":
                ds = load_dataset(dataset_name, split="train", streaming=True)
                sampled = 0
                for row in ds:
                    if sampled >= target_count:
                        break
                    text = row.get("question", "").strip()
                    if len(text) < 20:
                        continue
                    prompts.append({
                        "text": text,
                        "source": "open_source",
                        "dataset": dataset_name,
                        "category": "math_reasoning",
                    })
                    sampled += 1

                print(f"    Sampled {sampled} prompts")

            else:
                print(f"    Unknown dataset format: {dataset_name}, skipping")

        except Exception as e:
            print(f"    Error loading {dataset_name}: {e}")

    return prompts


# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------

def deduplicate(prompts: list[dict], threshold: int = 50) -> list[dict]:
    """
    Remove near-duplicate prompts using prefix hashing.

    Hashes the first `threshold` characters (lowercased, whitespace-normalised)
    and drops duplicates. Simple but effective for session transcripts where
    many conversations start with similar greetings or context.
    """
    seen = set()
    unique = []

    for p in prompts:
        normalised = re.sub(r"\s+", " ", p["text"].lower().strip())
        prefix = normalised[:threshold]
        h = hashlib.md5(prefix.encode()).hexdigest()

        if h not in seen:
            seen.add(h)
            unique.append(p)

    removed = len(prompts) - len(unique)
    print(f"  Deduplication: {removed} duplicates removed, {len(unique)} remaining")
    return unique


# ---------------------------------------------------------------------------
# Complexity scoring
# ---------------------------------------------------------------------------

def score_complexity(text: str) -> str:
    """Estimate prompt complexity: simple, medium, or complex."""
    length = len(text)
    sentences = len(re.findall(r"[.!?]+", text)) + 1
    questions = len(re.findall(r"\?", text))
    has_structure = bool(re.search(r"(\n[-*]|\n\d\.|\n#+)", text))

    score = 0
    if length > 200:
        score += 1
    if length > 500:
        score += 1
    if length > 1000:
        score += 1
    if sentences > 3:
        score += 1
    if questions > 1:
        score += 1
    if has_structure:
        score += 1

    if score <= 1:
        return "simple"
    elif score <= 3:
        return "medium"
    else:
        return "complex"


# ---------------------------------------------------------------------------
# Sampling
# ---------------------------------------------------------------------------

def sample_prompts(
    prompts: list[dict],
    target: int,
    transcript_ratio: float,
) -> list[dict]:
    """
    Sample prompts weighted toward medium/complex and respecting
    the transcript/open-source ratio.
    """
    import random
    random.seed(42)

    # Add complexity scores
    for p in prompts:
        p["complexity"] = score_complexity(p["text"])

    # Split by source
    transcript = [p for p in prompts if p["source"] == "transcript"]
    open_source = [p for p in prompts if p["source"] == "open_source"]

    transcript_target = int(target * transcript_ratio)
    open_source_target = target - transcript_target

    def weighted_sample(pool: list[dict], n: int) -> list[dict]:
        """Sample with 2x weight on medium, 3x on complex."""
        weights = {
            "simple": 1.0,
            "medium": 2.0,
            "complex": 3.0,
        }
        w = [weights.get(p["complexity"], 1.0) for p in pool]
        total = sum(w)
        w = [x / total for x in w]

        n = min(n, len(pool))
        indices = set()
        # Weighted sampling without replacement
        remaining = list(range(len(pool)))
        remaining_w = list(w)

        while len(indices) < n and remaining:
            total_w = sum(remaining_w)
            if total_w == 0:
                break
            r = random.random() * total_w
            cumulative = 0
            for i, (idx, weight) in enumerate(zip(remaining, remaining_w)):
                cumulative += weight
                if cumulative >= r:
                    indices.add(idx)
                    remaining.pop(i)
                    remaining_w.pop(i)
                    break

        return [pool[i] for i in sorted(indices)]

    sampled_transcript = weighted_sample(transcript, transcript_target)
    sampled_open = weighted_sample(open_source, open_source_target)

    result = sampled_transcript + sampled_open
    random.shuffle(result)

    print(f"  Sampled: {len(sampled_transcript)} transcript + {len(sampled_open)} open-source = {len(result)} total")
    return result


# ---------------------------------------------------------------------------
# Tier assignment
# ---------------------------------------------------------------------------

def assign_tiers(prompts: list[dict]) -> list[dict]:
    """Assign each prompt to a teacher tier (hard/medium/easy)."""
    tier_cfg = CONFIG["teacher"]["tiers"]

    for p in prompts:
        category = p.get("category", "general")
        assigned = "easy"  # default

        for tier_name, tier in tier_cfg.items():
            if category in tier.get("categories", []):
                assigned = tier_name
                break

        # Complexity override: complex prompts always go to hard tier
        if p.get("complexity") == "complex":
            assigned = "hard"

        p["tier"] = assigned

    tier_counts = Counter(p["tier"] for p in prompts)
    print(f"  Tier assignment: {dict(tier_counts)}")
    return prompts


# ---------------------------------------------------------------------------
# Statistics
# ---------------------------------------------------------------------------

def print_stats(prompts: list[dict]):
    """Print dataset statistics."""
    print(f"\n{'=' * 60}")
    print(f"Dataset Statistics ({len(prompts)} prompts)")
    print(f"{'=' * 60}")

    print(f"\nBy source:")
    for source, count in Counter(p["source"] for p in prompts).most_common():
        print(f"  {source}: {count}")

    if any(p.get("project") for p in prompts):
        print(f"\nBy project (transcripts only):")
        transcript = [p for p in prompts if p["source"] == "transcript"]
        for proj, count in Counter(p.get("project", "?") for p in transcript).most_common():
            print(f"  {proj}: {count}")

    print(f"\nBy category:")
    for cat, count in Counter(p["category"] for p in prompts).most_common():
        print(f"  {cat}: {count}")

    print(f"\nBy complexity:")
    for comp, count in Counter(p.get("complexity", "?") for p in prompts).most_common():
        print(f"  {comp}: {count}")

    if any(p.get("tier") for p in prompts):
        print(f"\nBy tier:")
        for tier, count in Counter(p.get("tier", "?") for p in prompts).most_common():
            print(f"  {tier}: {count}")

    lengths = [len(p["text"]) for p in prompts]
    print(f"\nText length (chars):")
    print(f"  min: {min(lengths)}, median: {sorted(lengths)[len(lengths)//2]}, max: {max(lengths)}")
    print(f"  mean: {sum(lengths) / len(lengths):.0f}")

    # Estimate tokens (~4 chars per token)
    est_tokens = sum(lengths) / 4
    print(f"\nEstimated total input tokens: {est_tokens:,.0f}")
    print(f"{'=' * 60}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Curate prompts for distillation")
    parser.add_argument("--extract-only", action="store_true",
                        help="Only extract from transcripts, skip open-source")
    parser.add_argument("--stats", action="store_true",
                        help="Show statistics for existing dataset")
    parser.add_argument("--output", type=Path, default=OUTPUT_DIR / "curated_prompts.jsonl",
                        help="Output file path")
    parser.add_argument("--target", type=int, default=PROMPT_CFG["target_count"],
                        help="Target number of prompts")
    args = parser.parse_args()

    # Stats mode: just load and display
    if args.stats:
        if not args.output.exists():
            print(f"No dataset found at {args.output}")
            sys.exit(1)
        prompts = [json.loads(line) for line in args.output.read_text().splitlines() if line.strip()]
        print_stats(prompts)
        return

    args.output.parent.mkdir(parents=True, exist_ok=True)

    # Phase 1: Extract from transcripts
    print("Phase 1: Extracting from transcripts...")
    prompts = extract_transcripts()
    print(f"  Total extracted: {len(prompts)}")

    # Phase 2: Load open-source (unless extract-only)
    if not args.extract_only:
        print("\nPhase 2: Loading open-source datasets...")
        open_source = load_open_source()
        prompts.extend(open_source)
        print(f"  Total after open-source: {len(prompts)}")
    else:
        print("\nPhase 2: Skipped (extract-only mode)")

    # Phase 3: Deduplicate
    print("\nPhase 3: Deduplicating...")
    prompts = deduplicate(prompts)

    # Phase 4: Sample
    print("\nPhase 4: Sampling...")
    prompts = sample_prompts(
        prompts,
        target=args.target,
        transcript_ratio=PROMPT_CFG["transcript_ratio"],
    )

    # Phase 5: Assign tiers
    print("\nPhase 5: Assigning teacher tiers...")
    prompts = assign_tiers(prompts)

    # Phase 6: Write output
    print(f"\nWriting {len(prompts)} prompts to {args.output}...")
    with open(args.output, "w") as f:
        for p in prompts:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")

    # Show stats
    print_stats(prompts)

    # Also write a held-out eval set (first 100 prompts not included in training)
    eval_output = args.output.parent / "eval_prompts.jsonl"
    # Re-extract all, take ones not in training set
    training_texts = {p["text"] for p in prompts}
    all_transcripts = extract_transcripts()
    eval_candidates = [p for p in all_transcripts if p["text"] not in training_texts]

    if eval_candidates:
        import random
        random.seed(99)
        eval_set = random.sample(eval_candidates, min(100, len(eval_candidates)))
        for p in eval_set:
            p["complexity"] = score_complexity(p["text"])
        with open(eval_output, "w") as f:
            for p in eval_set:
                f.write(json.dumps(p, ensure_ascii=False) + "\n")
        print(f"\nEval set: {len(eval_set)} held-out prompts written to {eval_output}")


if __name__ == "__main__":
    main()
