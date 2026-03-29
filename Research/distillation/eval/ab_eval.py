#!/usr/bin/env python3
"""A/B evaluation: opus_annie:122b vs qwen3.5:122b

Runs the same prompts through both models, then has a cross-family judge
(Mistral Small) score both outputs blind.

Phases:
  1. Generate — all prompts through model A, then all through model B
  2. Judge   — Mistral Small scores both outputs per prompt (blind, randomised)
  3. Report  — aggregate stats, per-dimension comparison

Usage:
  # Full run (generate + judge)
  python ab_eval.py

  # Generate only (judge later)
  python ab_eval.py --generate-only

  # Judge only (from existing responses)
  python ab_eval.py --judge-only

  # Use specific hosts
  python ab_eval.py --gen-host http://annuminas:11434 --judge-host http://anduril:11434
"""

import argparse
import json
import os
import random
import re
import sys
import time
import urllib.request
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

MODEL_A = "qwen3.5:122b"
MODEL_B = "opus_annie:122b"
JUDGE_MODEL = "mistral-small3.2:24b"

DEFAULT_GEN_HOST = "http://annuminas:11434"
DEFAULT_JUDGE_HOST = "http://anduril:11434"

GEN_NUM_CTX = 32768
GEN_NUM_PREDICT_BASE = 4096       # base model, thinking disabled
GEN_NUM_PREDICT_DISTILLED = 16384  # distilled model, needs room for think + response
GEN_TEMPERATURE = 0.7
JUDGE_NUM_PREDICT = 4096
JUDGE_TEMPERATURE = 0.1

EVAL_DIR = Path(__file__).parent
PROMPTS_DIR = EVAL_DIR / "prompts"
RUBRICS_DIR = EVAL_DIR / "rubrics"
OUTPUTS_DIR = EVAL_DIR / "outputs"

# ---------------------------------------------------------------------------
# LLM calling
# ---------------------------------------------------------------------------


def strip_think_tags(text: str) -> str:
    """Strip <think>...</think> blocks from model output."""
    # Closed tags
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    # Unclosed tags (thinking cut off by token limit)
    text = re.sub(r"<think>.*", "", text, flags=re.DOTALL)
    return text.strip()


def call_ollama(prompt: str, model: str, host: str,
                temperature: float, num_ctx: int,
                num_predict: int, think: bool | None = None) -> dict:
    """Call Ollama /api/chat endpoint.

    Args:
        think: True = let model think, False = disable, None = don't set (model default)
    """
    body = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "options": {
            "num_ctx": num_ctx,
            "num_predict": num_predict,
            "temperature": temperature,
        },
    }
    if think is not None:
        body["think"] = think

    payload = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{host.rstrip('/')}/api/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
    )

    t0 = time.time()
    try:
        resp = urllib.request.urlopen(req, timeout=600)
        data = json.loads(resp.read())
    except Exception as e:
        elapsed = time.time() - t0
        return {
            "output": "",
            "prompt_tokens": 0,
            "output_tokens": 0,
            "duration_ms": int(elapsed * 1000),
            "error": str(e),
        }

    elapsed = time.time() - t0
    message = data.get("message", {})
    raw_output = message.get("content", "").strip()
    thinking_output = message.get("thinking", "")
    output = strip_think_tags(raw_output)

    return {
        "output": output,
        "raw_output": raw_output,
        "thinking_length": len(thinking_output),
        "prompt_tokens": data.get("prompt_eval_count", 0),
        "output_tokens": data.get("eval_count", 0),
        "duration_ms": int(elapsed * 1000),
        "error": "",
    }


# ---------------------------------------------------------------------------
# Prompt loading
# ---------------------------------------------------------------------------


def load_prompts() -> list[dict]:
    """Load all prompt packs."""
    prompts = []
    for fname in ["creative_prompts.json", "breadth_prompts.json"]:
        path = PROMPTS_DIR / fname
        if path.exists():
            with open(path) as f:
                data = json.load(f)
            for p in data:
                p["source_file"] = fname
            prompts.extend(data)
    return prompts


def load_rubric(prompt: dict) -> str:
    """Load the appropriate rubric text for a prompt."""
    if prompt["source_file"] == "creative_prompts.json":
        rubric_path = RUBRICS_DIR / "distillation_creative_v1.md"
    else:
        rubric_path = RUBRICS_DIR / "distillation_breadth_v1.md"
    with open(rubric_path) as f:
        return f.read()


# ---------------------------------------------------------------------------
# Response file management
# ---------------------------------------------------------------------------


def get_responses_path() -> Path:
    """Get the current responses file path."""
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    # Find existing or create new
    existing = sorted(OUTPUTS_DIR.glob("ab_responses_*.jsonl"), reverse=True)
    if existing:
        return existing[0]
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    return OUTPUTS_DIR / f"ab_responses_{ts}.jsonl"


def get_scores_path(responses_path: Path) -> Path:
    """Derive scores path from responses path."""
    stem = responses_path.stem.replace("responses", "scores")
    return responses_path.parent / f"{stem}.jsonl"


def load_responses(path: Path) -> dict:
    """Load existing responses, keyed by (prompt_id, model)."""
    responses = {}
    if path.exists():
        with open(path) as f:
            for line in f:
                if line.strip():
                    d = json.loads(line)
                    key = (d["prompt_id"], d["model"])
                    responses[key] = d
    return responses


def load_scores(path: Path) -> dict:
    """Load existing scores, keyed by prompt_id."""
    scores = {}
    if path.exists():
        with open(path) as f:
            for line in f:
                if line.strip():
                    d = json.loads(line)
                    scores[d["prompt_id"]] = d
    return scores


def append_jsonl(path: Path, entry: dict):
    """Append a single entry to a JSONL file."""
    with open(path, "a") as f:
        f.write(json.dumps(entry) + "\n")


# ---------------------------------------------------------------------------
# Generation phase
# ---------------------------------------------------------------------------


def generate_all(prompts: list[dict], gen_host: str, responses_path: Path):
    """Generate responses from both models for all prompts.

    Batches by model to minimise Ollama model swaps.
    """
    existing = load_responses(responses_path)
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

    for model_label, model_name in [("A", MODEL_A), ("B", MODEL_B)]:
        # Count what's needed
        needed = [p for p in prompts
                  if (p["id"], model_name) not in existing]
        if not needed:
            print(f"  Model {model_label} ({model_name}): all {len(prompts)} prompts complete, skipping")
            continue

        print(f"\n{'='*60}")
        print(f"  Model {model_label}: {model_name}")
        print(f"  {len(needed)} prompts to generate ({len(prompts) - len(needed)} already done)")
        print(f"{'='*60}\n")

        # Warm up — trigger model load
        print(f"  Warming up {model_name}...")
        warmup = call_ollama("Say 'ready' and nothing else.", model_name,
                             gen_host, 0.1, 2048, 16)
        if warmup.get("error"):
            print(f"  WARNING: warmup failed: {warmup['error']}")
            print(f"  Continuing anyway...\n")
        else:
            print(f"  Model loaded ({warmup['duration_ms']}ms)\n")

        for i, prompt in enumerate(needed):
            print(f"  [{i+1}/{len(needed)}] {prompt['id']}...", end=" ", flush=True)

            # Base model: think=False, smaller budget (untrained thinking burns tokens)
            # Distilled model: don't pass think param, use larger budget
            # (model outputs <think> tags as text, stripped after generation)
            if model_name == MODEL_A:
                think_setting = False
                num_predict = GEN_NUM_PREDICT_BASE
            else:
                think_setting = None  # don't pass — model handles its own thinking
                num_predict = GEN_NUM_PREDICT_DISTILLED

            result = call_ollama(
                prompt["prompt"], model_name, gen_host,
                GEN_TEMPERATURE, GEN_NUM_CTX, num_predict,
                think=think_setting,
            )

            entry = {
                "prompt_id": prompt["id"],
                "prompt_type": prompt["type"],
                "source_file": prompt["source_file"],
                "model": model_name,
                "model_label": model_label,
                "output": result["output"],
                "prompt_tokens": result["prompt_tokens"],
                "output_tokens": result["output_tokens"],
                "duration_ms": result["duration_ms"],
                "error": result.get("error", ""),
                "timestamp": datetime.now().isoformat(),
            }
            append_jsonl(responses_path, entry)
            existing[(prompt["id"], model_name)] = entry

            word_count = len(result["output"].split())
            think_info = f", think={result.get('thinking_length', 0)}c" if result.get('thinking_length') else ""
            print(f"{word_count}w, {result['output_tokens']}tok, "
                  f"{result['duration_ms']/1000:.1f}s{think_info}"
                  f"{' ERROR: ' + result['error'] if result.get('error') else ''}")

    print(f"\nGeneration complete. Responses: {responses_path}")


# ---------------------------------------------------------------------------
# Judging phase
# ---------------------------------------------------------------------------


def build_judge_prompt(rubric_text: str, prompt_text: str,
                       output_x: str, output_y: str) -> str:
    """Build the comparative judge prompt."""
    return f"""You are an expert evaluator comparing two model outputs against the same prompt.

## Rubric

{rubric_text}

## Original Prompt

{prompt_text}

## Output X

{output_x}

## Output Y

{output_y}

## Instructions

Score BOTH outputs independently using the rubric dimensions above. For each output, provide the scoring table with evidence. Then compare and state your preference.

Follow the output format specified in the rubric EXACTLY. This is critical for automated parsing."""


def parse_ab_scores(response_text: str) -> dict:
    """Parse the judge's comparative response.

    Extracts scores for both Output X and Output Y.
    """
    result = {"x": {}, "y": {}, "preferred": "UNKNOWN", "margin": "UNKNOWN",
              "raw_length": len(response_text)}

    # Split into X and Y sections
    sections = re.split(r"###?\s*Output\s+([XY])", response_text, flags=re.IGNORECASE)

    current_label = None
    for part in sections:
        part_stripped = part.strip().upper()
        if part_stripped in ("X", "Y"):
            current_label = part_stripped.lower()
            continue
        if current_label is None:
            continue

        # Extract dimension scores from markdown table
        score_rows = re.findall(
            r"\|\s*\*?\*?([^|]+?)\*?\*?\s*\|\s*(\d+(?:\.\d+)?)\s*(?:/10)?\s*\|\s*/?(\d+)%?\s*\|\s*([\d.]+)\s*\|",
            part,
        )
        # Filter garbage rows
        score_rows = [(d, s, w, wt) for d, s, w, wt in score_rows
                      if d.strip().lower() not in ("dimension", "---", "", "score (1-10)")]

        scores = {}
        for dim, score, weight, weighted in score_rows:
            s = float(score)
            if s > 10:
                continue
            scores[dim.strip()] = {
                "score": s,
                "weight": int(weight),
                "weighted": float(weighted),
            }

        # Extract weighted total
        total_match = re.search(r"Weighted Total:\s*([\d.]+)/100", part)
        total = float(total_match.group(1)) if total_match else 0.0
        if not total and scores:
            total = sum(s["weighted"] for s in scores.values())

        # Sanity check
        if scores and (total < 10 or total > 100):
            recalc = sum(s["score"] * s["weight"] for s in scores.values()) / 10
            total = min(recalc, 100.0)

        result[current_label] = {"scores": scores, "weighted_total": total}

    # Extract comparison
    comparison = re.search(
        r"###?\s*Comparison(.*)",
        response_text, re.DOTALL | re.IGNORECASE
    )
    if comparison:
        comp_text = comparison.group(1)
        pref_match = re.search(r"Preferred:\s*\*?\*?([XY])\*?\*?", comp_text, re.IGNORECASE)
        if pref_match:
            result["preferred"] = pref_match.group(1).upper()
        margin_match = re.search(r"Margin:\s*\*?\*?(\w+)\*?\*?", comp_text, re.IGNORECASE)
        if margin_match:
            result["margin"] = margin_match.group(1)

    # Central tendency detection
    for label in ("x", "y"):
        if isinstance(result[label], dict) and "scores" in result[label]:
            score_vals = [s["score"] for s in result[label]["scores"].values()]
            if len(set(score_vals)) == 1 and len(score_vals) > 1:
                result[label]["central_tendency_warning"] = True

    return result


def judge_all(prompts: list[dict], judge_host: str,
              responses_path: Path, scores_path: Path):
    """Judge all prompt pairs."""
    responses = load_responses(responses_path)
    existing_scores = load_scores(scores_path)
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

    # Build pairs
    pairs = []
    for prompt in prompts:
        pid = prompt["id"]
        key_a = (pid, MODEL_A)
        key_b = (pid, MODEL_B)
        if key_a in responses and key_b in responses:
            if pid not in existing_scores:
                pairs.append((prompt, responses[key_a], responses[key_b]))
        elif pid not in existing_scores:
            missing = []
            if key_a not in responses:
                missing.append(MODEL_A)
            if key_b not in responses:
                missing.append(MODEL_B)
            print(f"  SKIP {pid}: missing responses from {', '.join(missing)}")

    if not pairs:
        print("  All prompts already judged (or missing responses)")
        return

    print(f"\n{'='*60}")
    print(f"  Judging {len(pairs)} prompt pairs")
    print(f"  Judge: {JUDGE_MODEL} on {judge_host}")
    print(f"{'='*60}\n")

    # Warm up judge
    print(f"  Warming up {JUDGE_MODEL}...")
    warmup = call_ollama("Say 'ready' and nothing else.", JUDGE_MODEL,
                         judge_host, 0.1, 2048, 16, think=False)
    if warmup.get("error"):
        print(f"  WARNING: warmup failed: {warmup['error']}")
    else:
        print(f"  Judge loaded ({warmup['duration_ms']}ms)\n")

    position_counts = {"AB": 0, "BA": 0}

    for i, (prompt, resp_a, resp_b) in enumerate(pairs):
        print(f"  [{i+1}/{len(pairs)}] {prompt['id']}...", end=" ", flush=True)

        rubric_text = load_rubric(prompt)

        # Randomise presentation order
        if random.random() > 0.5:
            output_x, output_y = resp_a["output"], resp_b["output"]
            order = "AB"  # X=A, Y=B
        else:
            output_x, output_y = resp_b["output"], resp_a["output"]
            order = "BA"  # X=B, Y=A
        position_counts[order] += 1

        judge_prompt = build_judge_prompt(
            rubric_text, prompt["prompt"], output_x, output_y
        )

        judge_result = call_ollama(
            judge_prompt, JUDGE_MODEL, judge_host,
            JUDGE_TEMPERATURE, GEN_NUM_CTX, JUDGE_NUM_PREDICT,
            think=False,
        )

        if judge_result.get("error"):
            print(f"ERROR: {judge_result['error']}")
            continue

        parsed = parse_ab_scores(judge_result["output"])

        # De-blind: map X/Y back to A/B
        if order == "AB":
            scores_a = parsed.get("x", {})
            scores_b = parsed.get("y", {})
            preferred_model = MODEL_A if parsed["preferred"] == "X" else (
                MODEL_B if parsed["preferred"] == "Y" else "UNKNOWN")
        else:
            scores_a = parsed.get("y", {})
            scores_b = parsed.get("x", {})
            preferred_model = MODEL_A if parsed["preferred"] == "Y" else (
                MODEL_B if parsed["preferred"] == "X" else "UNKNOWN")

        entry = {
            "prompt_id": prompt["id"],
            "prompt_type": prompt["type"],
            "source_file": prompt["source_file"],
            "presentation_order": order,
            "scores_a": scores_a,
            "scores_b": scores_b,
            "preferred": preferred_model,
            "margin": parsed.get("margin", "UNKNOWN"),
            "judge_tokens": judge_result["output_tokens"],
            "judge_duration_ms": judge_result["duration_ms"],
            "judge_raw": judge_result["output"][:500],  # first 500 chars for debugging
            "timestamp": datetime.now().isoformat(),
        }

        # Warnings
        warnings = []
        if parsed.get("x", {}).get("central_tendency_warning"):
            warnings.append("central_tendency_X")
        if parsed.get("y", {}).get("central_tendency_warning"):
            warnings.append("central_tendency_Y")
        if parsed["preferred"] == "UNKNOWN":
            warnings.append("no_preference_parsed")
        entry["warnings"] = warnings

        append_jsonl(scores_path, entry)

        total_a = scores_a.get("weighted_total", 0) if isinstance(scores_a, dict) else 0
        total_b = scores_b.get("weighted_total", 0) if isinstance(scores_b, dict) else 0
        pref = "A" if preferred_model == MODEL_A else ("B" if preferred_model == MODEL_B else "?")
        warn_str = f" [{', '.join(warnings)}]" if warnings else ""
        print(f"A={total_a:.1f} B={total_b:.1f} pref={pref}{warn_str}")

    print(f"\nJudging complete. Scores: {scores_path}")
    print(f"Position distribution: {position_counts}")


# ---------------------------------------------------------------------------
# Quick summary
# ---------------------------------------------------------------------------


def print_summary(scores_path: Path):
    """Print a quick summary of results."""
    scores = []
    if not scores_path.exists():
        print("No scores file found.")
        return

    with open(scores_path) as f:
        for line in f:
            if line.strip():
                scores.append(json.loads(line))

    if not scores:
        print("No scores recorded.")
        return

    print(f"\n{'='*60}")
    print(f"  RESULTS SUMMARY ({len(scores)} prompts)")
    print(f"  {MODEL_A} (A) vs {MODEL_B} (B)")
    print(f"{'='*60}\n")

    # Win/loss/draw
    wins_a, wins_b, draws = 0, 0, 0
    totals_a, totals_b = [], []
    by_type = {}

    for s in scores:
        sa = s.get("scores_a", {})
        sb = s.get("scores_b", {})
        ta = sa.get("weighted_total", 0) if isinstance(sa, dict) else 0
        tb = sb.get("weighted_total", 0) if isinstance(sb, dict) else 0
        totals_a.append(ta)
        totals_b.append(tb)

        pref = s.get("preferred", "UNKNOWN")
        if pref == MODEL_A:
            wins_a += 1
        elif pref == MODEL_B:
            wins_b += 1
        else:
            draws += 1

        # By type
        ptype = s.get("prompt_type", "unknown")
        by_type.setdefault(ptype, {"a": [], "b": [], "wins_a": 0, "wins_b": 0})
        by_type[ptype]["a"].append(ta)
        by_type[ptype]["b"].append(tb)
        if pref == MODEL_A:
            by_type[ptype]["wins_a"] += 1
        elif pref == MODEL_B:
            by_type[ptype]["wins_b"] += 1

    avg_a = sum(totals_a) / len(totals_a) if totals_a else 0
    avg_b = sum(totals_b) / len(totals_b) if totals_b else 0

    print(f"  Overall scores:  A={avg_a:.1f}  B={avg_b:.1f}  (delta={avg_b - avg_a:+.1f})")
    print(f"  Preferences:     A={wins_a}  B={wins_b}  unknown={draws}")
    print()

    # By type
    print("  By prompt type:")
    for ptype, data in sorted(by_type.items()):
        avg_ta = sum(data["a"]) / len(data["a"]) if data["a"] else 0
        avg_tb = sum(data["b"]) / len(data["b"]) if data["b"] else 0
        n = len(data["a"])
        print(f"    {ptype:25s} (n={n:2d}): A={avg_ta:.1f}  B={avg_tb:.1f}  "
              f"delta={avg_tb - avg_ta:+.1f}  wins A={data['wins_a']} B={data['wins_b']}")

    # Position bias check
    first_preferred = 0
    total_with_pref = 0
    for s in scores:
        order = s.get("presentation_order", "AB")
        pref = s.get("preferred", "UNKNOWN")
        if pref == "UNKNOWN":
            continue
        total_with_pref += 1
        if order == "AB" and pref == MODEL_A:
            first_preferred += 1
        elif order == "BA" and pref == MODEL_B:
            first_preferred += 1

    if total_with_pref > 0:
        bias_pct = first_preferred / total_with_pref * 100
        print(f"\n  Position bias: first-presented preferred {bias_pct:.0f}% "
              f"({first_preferred}/{total_with_pref}) — expect ~50%")

    # Warnings
    warned = [s for s in scores if s.get("warnings")]
    if warned:
        print(f"\n  Warnings on {len(warned)} prompts:")
        for s in warned:
            print(f"    {s['prompt_id']}: {', '.join(s['warnings'])}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(
        description="A/B evaluation: opus_annie:122b vs qwen3.5:122b"
    )
    parser.add_argument("--gen-host", default=DEFAULT_GEN_HOST,
                        help=f"Ollama host for generation (default: {DEFAULT_GEN_HOST})")
    parser.add_argument("--judge-host", default=DEFAULT_JUDGE_HOST,
                        help=f"Ollama host for judging (default: {DEFAULT_JUDGE_HOST})")
    parser.add_argument("--generate-only", action="store_true",
                        help="Generate responses only, skip judging")
    parser.add_argument("--judge-only", action="store_true",
                        help="Judge existing responses only, skip generation")
    parser.add_argument("--summary-only", action="store_true",
                        help="Print summary of existing scores")
    parser.add_argument("--responses", type=Path, default=None,
                        help="Path to existing responses file")
    args = parser.parse_args()

    prompts = load_prompts()
    print(f"Loaded {len(prompts)} prompts")

    responses_path = args.responses or get_responses_path()
    scores_path = get_scores_path(responses_path)

    if args.summary_only:
        print_summary(scores_path)
        return

    if not args.judge_only:
        print(f"\n--- Phase 1: Generation ---")
        print(f"Models: {MODEL_A} (A), {MODEL_B} (B)")
        print(f"Host: {args.gen_host}")
        print(f"Responses: {responses_path}")
        generate_all(prompts, args.gen_host, responses_path)

    if not args.generate_only:
        print(f"\n--- Phase 2: Judging ---")
        print(f"Judge: {JUDGE_MODEL}")
        print(f"Host: {args.judge_host}")
        print(f"Scores: {scores_path}")
        judge_all(prompts, args.judge_host, responses_path, scores_path)

        print_summary(scores_path)


if __name__ == "__main__":
    main()
