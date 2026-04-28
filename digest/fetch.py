import feedparser
import urllib.parse


def fetch_articles(keyword: str, num: int = 10) -> list[dict]:
    """Fetch articles from Google News RSS for a given keyword."""
    encoded = urllib.parse.quote(keyword)
    url = f"https://news.google.com/rss/search?q={encoded}&hl=en-CA&gl=CA&ceid=CA:en&num={num}"

    feed = feedparser.parse(url)
    articles = []

    for entry in feed.entries[:num]:
        articles.append({
            "title": entry.get("title", "").strip(),
            "url": entry.get("link", "").strip(),
            "source": entry.get("source", {}).get("title", "Unknown"),
            "published": entry.get("published", ""),
            "keyword": keyword,
        })

    return articles
