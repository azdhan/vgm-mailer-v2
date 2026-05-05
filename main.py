import os
import sys
import json
import traceback
from pathlib import Path
from keywords import KEYWORDS
from digest.fetch import fetch_articles
from digest.score import filter_articles
from digest.email_digest import send_digest
from digest.store import save_to_supabase

SCORE_THRESHOLD = int(os.environ.get("SCORE_THRESHOLD", "3"))
MAX_PER_KEYWORD = 3
SEEN_FILE = Path("seen_urls.json")


def load_seen() -> set:
    if SEEN_FILE.exists():
        try:
            return set(json.loads(SEEN_FILE.read_text()))
        except Exception:
            return set()
    return set()


def save_seen(seen: set):
    SEEN_FILE.write_text(json.dumps(sorted(seen), indent=2))


def run():
    print(f"Starting digest run. {len(KEYWORDS)} keywords, threshold={SCORE_THRESHOLD}")

    sent_urls = load_seen()
    print(f"Loaded {len(sent_urls)} previously sent URLs")

    all_scored = []
    this_run_urls = set()

    for keyword in KEYWORDS:
        print(f"\nFetching: {keyword}")
        try:
            articles = fetch_articles(keyword)
            fresh = [
                a for a in articles
                if a["url"] not in sent_urls and a["url"] not in this_run_urls
            ]
            this_run_urls.update(a["url"] for a in articles)
            skipped = len(articles) - len(fresh)
            print(f"  {len(articles)} fetched, {skipped} skipped (duplicates), {len(fresh)} new")
            if not fresh:
                continue
            passing = filter_articles(fresh, threshold=SCORE_THRESHOLD)
            passing = sorted(passing, key=lambda x: x.get("score", 0), reverse=True)[:MAX_PER_KEYWORD]
            print(f"  {len(passing)} kept after cap")
            all_scored.extend(passing)
        except Exception as e:
            print(f"  ERROR on keyword '{keyword}': {e}")
            traceback.print_exc()
            continue

    print(f"\nTotal articles to send: {len(all_scored)}")

    try:
        send_digest(all_scored)
    except Exception as e:
        print(f"EMAIL ERROR: {e}")
        traceback.print_exc()
        sys.exit(1)

    save_to_supabase(all_scored)
    save_seen(sent_urls | {a["url"] for a in all_scored})
    print(f"Saved {len(sent_urls) + len(all_scored)} total seen URLs")


if __name__ == "__main__":
    run()
