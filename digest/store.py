import os
import traceback
from datetime import date
from email.utils import parsedate_to_datetime

from supabase import create_client


def _parse_date(raw: str) -> str:
    """Parse an RFC 2822 date string (from RSS) to YYYY-MM-DD. Falls back to today."""
    try:
        return parsedate_to_datetime(raw).date().isoformat()
    except Exception:
        return date.today().isoformat()


def save_to_supabase(articles: list[dict]) -> None:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("Supabase env vars not set — skipping save.")
        return

    try:
        client = create_client(url, key)
        rows = [
            {
                "date": _parse_date(a.get("published", "")),
                "title": a["title"],
                "url": a["url"],
                "source": a["source"],
                "keyword": a["keyword"],
            }
            for a in articles
        ]
        if rows:
            client.table("articles").upsert(rows, on_conflict="url").execute()
            print(f"Saved {len(rows)} articles to Supabase.")
    except Exception as e:
        print(f"SUPABASE ERROR: {e}")
        traceback.print_exc()
