#!/usr/bin/env python3
"""
Step 6: Build podcast corpus for distillation.

Scrapes podcast transcripts from HappyScribe, extracts conversational
question/answer segments, and outputs prompts in the same JSONL format
as 01_curate_prompts.py for teacher generation via 02_generate_teacher.py.

Usage:
    python 06_podcast_corpus.py                            # Full pipeline
    python 06_podcast_corpus.py --scrape-only              # Just scrape transcripts
    python 06_podcast_corpus.py --extract-only             # Extract from cached transcripts
    python 06_podcast_corpus.py --stats                    # Show statistics
    python 06_podcast_corpus.py --links /path/to/links.md  # Custom links file

Requires:
    pip install cloudscraper beautifulsoup4 pyyaml
"""

import argparse
import hashlib
import json
import re
import sys
import time
from collections import Counter
from pathlib import Path

import yaml

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
CONFIG = yaml.safe_load((SCRIPT_DIR / "config.yaml").read_text())

DATA_DIR = SCRIPT_DIR / "data" / "podcasts"
OUTPUT_FILE = SCRIPT_DIR / "data" / "prompts" / "podcast_prompts.jsonl"

DEFAULT_LINKS_FILE = Path("/home/jack/podcastlinks.md")

# Minimum characters for a question to be worth using as a prompt
MIN_QUESTION_LEN = 60
# Maximum characters
MAX_QUESTION_LEN = 2000
# Minimum characters for a context block (question + surrounding context)
MIN_CONTEXT_LEN = 120

# Filler-heavy text is low quality (auto-transcription artefacts)
MAX_FILLER_RATIO = 0.15
FILLER_WORDS = {"like", "you know", "um", "uh", "yeah", "right", "okay",
                "kind of", "sort of", "i mean", "basically"}

# Podcast ad/sponsor patterns to skip
AD_PATTERNS = [
    re.compile(p, re.IGNORECASE) for p in [
        r"brought to you by",
        r"sponsor(ed|s)?",
        r"promo code",
        r"discount",
        r"coupon",
        r"free trial",
        r"sign up (at|for)",
        r"check out .* at",
        r"use code",
        r"percent off",
        r"link in the (show notes|description)",
        r"head (on )?over to",
        r"subscribe",
        r"rate (and|&) review",
        r"patreon",
        r"merch",
        r"dot com slash",
    ]
]

# Category keywords for podcast content
PODCAST_CATEGORIES = {
    "psychology": [
        "psychology", "cognitive", "bias", "behavior", "behaviour", "emotion",
        "mental", "therapy", "trauma", "anxiety", "depression", "narciss",
        "attachment", "personality", "habit", "mindset", "subconscious",
    ],
    "health_fitness": [
        "health", "exercise", "workout", "muscle", "diet", "nutrition",
        "sleep", "cortisol", "testosterone", "longevity", "metabol",
        "supplement", "protein", "cardio", "weight", "body fat",
    ],
    "philosophy": [
        "philosophy", "meaning", "purpose", "moral", "ethic", "virtue",
        "stoic", "existential", "consciousness", "free will", "truth",
        "wisdom", "ancient", "socrates", "plato", "nietzsche",
    ],
    "business": [
        "business", "money", "income", "invest", "entrepreneur", "startup",
        "revenue", "profit", "scale", "market", "brand", "sell",
        "customer", "leadership", "manage", "hire",
    ],
    "technology": [
        "algorithm", "ai", "artificial intelligence", "machine learning",
        "data", "computer", "software", "tech", "robot", "automat",
        "internet", "digital", "code", "programming",
    ],
    "relationships": [
        "relationship", "dating", "marriage", "love", "partner", "family",
        "friend", "trust", "communication", "conflict", "breakup",
        "divorce", "intimacy", "vulnerability",
    ],
    "storytelling": [
        "story", "experience", "happened", "remember", "grew up",
        "childhood", "journey", "lesson", "mistake", "learned",
    ],
    "creative": [
        "art", "music", "film", "movie", "book", "write", "creative",
        "design", "photograph", "paint", "perform", "act",
    ],
}


# ---------------------------------------------------------------------------
# Scraping
# ---------------------------------------------------------------------------

def parse_links(links_file: Path) -> list[dict]:
    """Parse podcast URLs from a markdown file."""
    urls = []
    for line in links_file.read_text().splitlines():
        line = line.strip()
        if not line or not line.startswith("http"):
            continue

        # Extract show and episode from URL
        # Format: https://podcasts.happyscribe.com/{show}/{episode}
        parts = line.rstrip("/").split("/")
        if len(parts) >= 5:
            show = parts[-2]
            episode = parts[-1]
        else:
            show = "unknown"
            episode = parts[-1] if parts else "unknown"

        urls.append({
            "url": line,
            "show": show,
            "episode": episode,
        })

    return urls


def scrape_transcript(url: str, scraper) -> list[dict]:
    """
    Scrape a single transcript from HappyScribe.

    Returns a list of paragraph dicts with 'timestamp' and 'text' keys.
    """
    try:
        r = scraper.get(url, timeout=30)
        r.raise_for_status()
    except Exception as e:
        print(f"    Error fetching {url}: {e}")
        return []

    from bs4 import BeautifulSoup
    soup = BeautifulSoup(r.text, "html.parser")

    body = soup.find("div", class_="episode-transcription-body")
    if not body:
        print(f"    No transcript body found")
        return []

    paragraphs = body.find_all("div", class_="hsp-paragraph")
    result = []

    for p in paragraphs:
        ts_el = p.find("span", class_="hsp-paragraph-timestamp")
        text_el = p.find("p", class_="hsp-paragraph-words")

        ts = ts_el.get_text(strip=True) if ts_el else ""
        text = text_el.get_text(strip=True) if text_el else ""

        if text:
            result.append({"timestamp": ts, "text": text})

    return result


def scrape_all(links_file: Path) -> dict[str, list[dict]]:
    """Scrape all transcripts, caching results to disk."""
    import cloudscraper

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    urls = parse_links(links_file)
    print(f"Found {len(urls)} podcast URLs")

    scraper = cloudscraper.create_scraper()
    transcripts = {}

    for i, entry in enumerate(urls):
        url = entry["url"]
        show = entry["show"]
        episode = entry["episode"]
        cache_file = DATA_DIR / f"{show}__{episode}.json"

        # Use cache if available
        if cache_file.exists():
            paragraphs = json.loads(cache_file.read_text())
            print(f"  [{i+1}/{len(urls)}] Cached: {show}/{episode} ({len(paragraphs)} paragraphs)")
            transcripts[f"{show}/{episode}"] = paragraphs
            continue

        print(f"  [{i+1}/{len(urls)}] Scraping: {show}/{episode}...", end=" ", flush=True)
        paragraphs = scrape_transcript(url, scraper)

        if paragraphs:
            cache_file.write_text(json.dumps(paragraphs, ensure_ascii=False, indent=2))
            print(f"{len(paragraphs)} paragraphs")
        else:
            print("FAILED")

        transcripts[f"{show}/{episode}"] = paragraphs

        # Polite delay between requests
        time.sleep(2)

    return transcripts


# ---------------------------------------------------------------------------
# Turn extraction
# ---------------------------------------------------------------------------

def _is_ad(text: str) -> bool:
    """Check if a paragraph is likely an advertisement."""
    return any(p.search(text) for p in AD_PATTERNS)


def _is_intro_outro(text: str, idx: int, total: int) -> bool:
    """Check if a paragraph is likely intro/outro material."""
    # First 3% or last 2% of episode
    if idx < total * 0.03 or idx > total * 0.98:
        intro_words = ["welcome", "listening", "subscribe", "episode", "podcast",
                       "thank you for", "thanks for listening", "see you next"]
        text_lower = text.lower()
        return any(w in text_lower for w in intro_words)
    return False


def extract_questions(paragraphs: list[dict]) -> list[dict]:
    """
    Extract question-containing segments from a transcript.

    Looks for paragraphs containing questions (ending with ?) and bundles
    them with 1-2 preceding paragraphs for context. This captures the
    natural conversational flow rather than isolated questions.
    """
    if not paragraphs:
        return []

    total = len(paragraphs)
    questions = []
    used_indices = set()

    for i, para in enumerate(paragraphs):
        text = para["text"]

        # Skip ads, intro/outro
        if _is_ad(text):
            continue
        if _is_intro_outro(text, i, total):
            continue

        # Look for questions
        if "?" not in text:
            continue

        # Skip very short questions
        if len(text) < MIN_QUESTION_LEN:
            continue

        # Skip if already used as context for another question
        if i in used_indices:
            continue

        # Build context: include 1-2 preceding non-ad paragraphs
        context_parts = []
        lookback = 0
        for j in range(max(0, i - 2), i):
            if j in used_indices:
                continue
            prev_text = paragraphs[j]["text"]
            if _is_ad(prev_text) or len(prev_text) < 20:
                continue
            context_parts.append(prev_text)
            lookback += 1

        # The question itself
        context_parts.append(text)

        # If the question is very short, include 1 following paragraph as context
        if len(text) < 80 and i + 1 < total:
            next_text = paragraphs[i + 1]["text"]
            if not _is_ad(next_text) and len(next_text) > 20:
                context_parts.append(next_text)

        full_text = "\n\n".join(context_parts)

        if len(full_text) < MIN_CONTEXT_LEN or len(full_text) > MAX_QUESTION_LEN:
            continue

        # Skip filler-heavy text (transcription artefacts)
        words = full_text.lower().split()
        if words:
            filler_count = sum(1 for w in words if w.strip(".,!?") in FILLER_WORDS)
            if filler_count / len(words) > MAX_FILLER_RATIO:
                continue

        # Skip text that's too pronoun-heavy without clear referents
        # (context-dependent fragments that won't make sense standalone)
        if len(text) < 100:
            pronoun_starts = sum(1 for s in re.split(r'[.!?]', text)
                                if s.strip().lower().startswith(("it ", "that ", "this ", "they ")))
            sentences = len(re.split(r'[.!?]', text))
            if sentences > 0 and pronoun_starts / max(sentences, 1) > 0.6:
                continue

        # Mark indices as used
        used_indices.add(i)
        for j in range(max(0, i - 2), i):
            used_indices.add(j)

        questions.append({
            "text": full_text,
            "question_text": text,
            "timestamp": para["timestamp"],
            "paragraph_idx": i,
        })

    return questions


def extract_interesting_statements(paragraphs: list[dict]) -> list[dict]:
    """
    Extract interesting non-question statements that could serve as
    discussion prompts. Looks for opinion markers, storytelling cues,
    and analytical statements.
    """
    if not paragraphs:
        return []

    total = len(paragraphs)
    statements = []
    opinion_markers = [
        "i think", "i believe", "the problem is", "the thing is",
        "what people don't realise", "what people don't realize",
        "the truth is", "here's the thing", "the interesting thing",
        "the mistake", "the key", "the secret", "most people",
        "the reason", "what happened was", "the biggest",
        "one of the most", "the real", "actually,",
    ]

    for i, para in enumerate(paragraphs):
        text = para["text"]

        if _is_ad(text) or _is_intro_outro(text, i, total):
            continue
        if len(text) < 100:
            continue

        text_lower = text.lower()
        if not any(m in text_lower for m in opinion_markers):
            continue

        # Skip filler-heavy statements
        words = text_lower.split()
        if words:
            filler_count = sum(1 for w in words if w.strip(".,!?") in FILLER_WORDS)
            if filler_count / len(words) > MAX_FILLER_RATIO:
                continue

        # Skip statements that are too fragmented (many short sentences)
        sentences = [s.strip() for s in re.split(r'[.!?]', text) if s.strip()]
        if len(sentences) > 1:
            avg_sentence_len = sum(len(s) for s in sentences) / len(sentences)
            if avg_sentence_len < 25:
                continue

        # Use the statement directly as a prompt — more natural than framing
        prompt = text

        if len(prompt) > MAX_QUESTION_LEN:
            continue

        statements.append({
            "text": prompt,
            "original_text": text,
            "timestamp": para["timestamp"],
            "paragraph_idx": i,
        })

    return statements


# ---------------------------------------------------------------------------
# Categorisation and deduplication
# ---------------------------------------------------------------------------

def categorise(text: str) -> str:
    """Categorise a podcast prompt by topic."""
    text_lower = text.lower()
    scores = {}
    for category, keywords in PODCAST_CATEGORIES.items():
        scores[category] = sum(1 for kw in keywords if kw in text_lower)

    if not scores or max(scores.values()) == 0:
        return "general_conversation"
    return max(scores, key=scores.get)


def deduplicate(prompts: list[dict], threshold: int = 60) -> list[dict]:
    """Remove near-duplicate prompts using prefix hashing."""
    seen = set()
    unique = []

    for p in prompts:
        normalised = re.sub(r"\s+", " ", p["text"].lower().strip())
        prefix = normalised[:threshold]
        h = hashlib.md5(prefix.encode()).hexdigest()

        if h not in seen:
            seen.add(h)
            unique.append(p)

    return unique


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def load_cached_transcripts() -> dict[str, list[dict]]:
    """Load all cached transcripts from disk."""
    transcripts = {}
    if not DATA_DIR.exists():
        return transcripts

    for f in sorted(DATA_DIR.glob("*.json")):
        key = f.stem.replace("__", "/")
        transcripts[key] = json.loads(f.read_text())

    return transcripts


def build_corpus(transcripts: dict[str, list[dict]], target: int = 500) -> list[dict]:
    """Extract, filter, categorise, and sample podcast prompts."""
    import random
    random.seed(42)

    all_prompts = []

    for episode_key, paragraphs in transcripts.items():
        show, episode = episode_key.split("/", 1) if "/" in episode_key else ("unknown", episode_key)

        # Extract questions
        questions = extract_questions(paragraphs)
        for q in questions:
            q["source"] = "podcast"
            q["format"] = "question"
            q["show"] = show
            q["episode"] = episode

        # Extract interesting statements
        statements = extract_interesting_statements(paragraphs)
        for s in statements:
            s["source"] = "podcast"
            s["format"] = "statement"
            s["show"] = show
            s["episode"] = episode

        all_prompts.extend(questions)
        all_prompts.extend(statements)

    print(f"  Raw extractions: {len(all_prompts)} ({sum(1 for p in all_prompts if p['format'] == 'question')} questions, {sum(1 for p in all_prompts if p['format'] == 'statement')} statements)")

    # Deduplicate
    all_prompts = deduplicate(all_prompts)
    print(f"  After dedup: {len(all_prompts)}")

    # Categorise
    for p in all_prompts:
        p["category"] = categorise(p["text"])

    # Sample: balance across shows and categories
    # First, ensure representation from each show
    by_show = {}
    for p in all_prompts:
        by_show.setdefault(p["show"], []).append(p)

    sampled = []
    if len(all_prompts) <= target:
        sampled = all_prompts
    else:
        # Guarantee at least 3 prompts per show (if available)
        min_per_show = 3
        for show, show_prompts in by_show.items():
            n = min(min_per_show, len(show_prompts))
            sampled.extend(random.sample(show_prompts, n))

        # Fill remaining from the full pool
        sampled_texts = {p["text"] for p in sampled}
        remaining = [p for p in all_prompts if p["text"] not in sampled_texts]
        random.shuffle(remaining)
        needed = target - len(sampled)
        sampled.extend(remaining[:needed])

    random.shuffle(sampled)

    # Assign tiers — all podcast prompts go to easy/medium (Sonnet)
    # since they're conversational, not complex reasoning
    for p in sampled:
        if p["category"] in ("technology", "philosophy"):
            p["tier"] = "medium"
        else:
            p["tier"] = "easy"

        # Clean up internal fields before output
        for key in ["question_text", "original_text", "timestamp", "paragraph_idx"]:
            p.pop(key, None)

    print(f"  Final sample: {len(sampled)} prompts")
    return sampled


def print_stats(prompts: list[dict]):
    """Print corpus statistics."""
    print(f"\n{'=' * 60}")
    print(f"Podcast Corpus Statistics ({len(prompts)} prompts)")
    print(f"{'=' * 60}")

    print(f"\nBy show:")
    for show, count in Counter(p["show"] for p in prompts).most_common():
        print(f"  {show}: {count}")

    print(f"\nBy category:")
    for cat, count in Counter(p["category"] for p in prompts).most_common():
        print(f"  {cat}: {count}")

    print(f"\nBy format:")
    for fmt, count in Counter(p["format"] for p in prompts).most_common():
        print(f"  {fmt}: {count}")

    print(f"\nBy tier:")
    for tier, count in Counter(p.get("tier", "?") for p in prompts).most_common():
        print(f"  {tier}: {count}")

    lengths = [len(p["text"]) for p in prompts]
    print(f"\nText length (chars):")
    print(f"  min: {min(lengths)}, median: {sorted(lengths)[len(lengths)//2]}, max: {max(lengths)}")
    print(f"  mean: {sum(lengths) / len(lengths):.0f}")

    est_tokens = sum(lengths) / 4
    print(f"\nEstimated total input tokens: {est_tokens:,.0f}")

    # Cost estimate for Sonnet teacher generation
    avg_output_tokens = 400  # Conversational responses are shorter
    total_output = len(prompts) * avg_output_tokens
    sonnet_cost = (est_tokens * 3 + total_output * 15) / 1_000_000
    print(f"Estimated Sonnet teacher generation cost: ${sonnet_cost:.2f}")
    print(f"{'=' * 60}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Build podcast corpus for distillation")
    parser.add_argument("--links", type=Path, default=DEFAULT_LINKS_FILE,
                        help="Path to file with HappyScribe URLs")
    parser.add_argument("--scrape-only", action="store_true",
                        help="Only scrape transcripts, don't extract prompts")
    parser.add_argument("--extract-only", action="store_true",
                        help="Only extract from cached transcripts")
    parser.add_argument("--stats", action="store_true",
                        help="Show statistics for existing corpus")
    parser.add_argument("--target", type=int, default=500,
                        help="Target number of prompts (default: 500)")
    parser.add_argument("--output", type=Path, default=OUTPUT_FILE,
                        help="Output file path")
    args = parser.parse_args()

    # Stats mode
    if args.stats:
        if not args.output.exists():
            print(f"No corpus found at {args.output}")
            sys.exit(1)
        prompts = [json.loads(line) for line in args.output.read_text().splitlines() if line.strip()]
        print_stats(prompts)
        return

    # Phase 1: Scrape
    if not args.extract_only:
        print("Phase 1: Scraping transcripts from HappyScribe...")
        if not args.links.exists():
            print(f"Error: Links file not found: {args.links}")
            sys.exit(1)
        transcripts = scrape_all(args.links)
        total_paras = sum(len(v) for v in transcripts.values())
        successful = sum(1 for v in transcripts.values() if v)
        print(f"  Scraped {successful}/{len(transcripts)} episodes ({total_paras} total paragraphs)")
    else:
        print("Phase 1: Loading cached transcripts...")
        transcripts = load_cached_transcripts()
        print(f"  Loaded {len(transcripts)} cached transcripts")

    if args.scrape_only:
        print("\nScrape complete. Run without --scrape-only to extract prompts.")
        return

    if not transcripts:
        print("Error: No transcripts available. Run scraping first.")
        sys.exit(1)

    # Phase 2: Extract and build corpus
    print("\nPhase 2: Extracting prompts...")
    prompts = build_corpus(transcripts, target=args.target)

    # Phase 3: Write output
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w") as f:
        for p in prompts:
            f.write(json.dumps(p, ensure_ascii=False) + "\n")
    print(f"\nWritten {len(prompts)} prompts to {args.output}")

    # Show stats
    print_stats(prompts)

    print(f"\nNext step: generate teacher completions with:")
    print(f"  python 02_generate_teacher.py --prompts {args.output}")


if __name__ == "__main__":
    main()
