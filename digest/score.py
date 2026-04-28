import os
import re
import json
import anthropic

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

SYSTEM_PROMPT = """You are a relevance filter for a news digest serving a coaching business.
The client works with pre-med students, law students, and professionals in Canada and the US.
They track topics including: medical school admissions, law school admissions, student mental health,
student debt, physician burnout, AI in education/law/medicine, Canadian businesses, wellness brands,
and legal tech.

For each article, score its relevance 1-5:
5 = highly relevant, substantive, newsworthy
4 = relevant, useful context
3 = borderline, tangentially related
2 = weak match, generic or vague
1 = clickbait, off-topic, or irrelevant noise

Reply ONLY with valid JSON in this exact format, no other text:
{"score": <1-5>, "reason": "<one short sentence>"}"""


def score_article(title: str, source: str, keyword: str) -> dict:
    """Score a single article using Claude Haiku."""
    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=100,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f'Title: "{title}"\nSource: {source}\nKeyword that triggered this: "{keyword}"',
                }
            ],
        )
        raw = message.content[0].text.strip()
        print(f"  Raw scoring response: {raw[:120]}")
        # strip markdown code fences if the model wraps its response
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if not match:
            raise ValueError(f"No JSON object found in response: {raw[:120]}")
        return json.loads(match.group())
    except json.JSONDecodeError as e:
        print(f"  JSON parse error for '{title}': {e}")
        return {"score": 1, "reason": "Scoring unavailable"}
    except anthropic.APIError as e:
        print(f"  Anthropic API error for '{title}': {e}")
        return {"score": 1, "reason": "Scoring unavailable"}
    except Exception as e:
        print(f"  Scoring error for '{title}': {type(e).__name__}: {e}")
        return {"score": 1, "reason": "Scoring unavailable"}


def filter_articles(articles: list[dict], threshold: int = 3) -> list[dict]:
    """Score all articles and return those at or above the threshold."""
    scored = []
    for article in articles:
        result = score_article(article["title"], article["source"], article["keyword"])
        article["score"] = result.get("score", 3)
        article["reason"] = result.get("reason", "")
        print(f"  [{article['score']}/5] {article['title'][:60]}...")
        if article["score"] >= threshold:
            scored.append(article)
    return scored
