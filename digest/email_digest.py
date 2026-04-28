import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from collections import defaultdict
from datetime import date


def build_html(articles: list[dict]) -> str:
    grouped = defaultdict(list)
    for a in articles:
        grouped[a["keyword"]].append(a)

    today = date.today().strftime("%B %d, %Y")
    total = len(articles)

    sections = ""
    for keyword, items in sorted(grouped.items()):
        rows = ""
        for a in items:
            score = a.get("score", 3)
            reason = a.get("reason", "")
            source = a.get("source", "Unknown")
            rows += (
                f'<div style="margin-bottom:12px;">'
                f'<a href="{a["url"]}" style="font-weight:bold;color:#111;text-decoration:none;font-size:14px;">{a["title"]}</a><br>'
                f'<span style="font-size:12px;color:#888;">{source} &nbsp;·&nbsp; {score}/5 &nbsp;·&nbsp; {reason}</span>'
                f'</div>'
            )
        sections += (
            f'<div style="margin-bottom:22px;">'
            f'<p style="margin:0 0 6px;font-size:11px;font-weight:bold;text-transform:uppercase;color:#999;letter-spacing:1px;">{keyword}</p>'
            f'<hr style="border:none;border-top:1px solid #e0e0e0;margin:0 0 10px;">'
            f'{rows}'
            f'</div>'
        )

    return (
        '<html><body style="font-family:Arial,sans-serif;color:#111;max-width:580px;margin:0 auto;padding:20px 16px;">'
        f'<h2 style="margin:0 0 2px;font-size:20px;">News Digest</h2>'
        f'<p style="margin:0 0 18px;color:#999;font-size:13px;">{today} &nbsp;·&nbsp; {total} articles</p>'
        '<hr style="border:none;border-top:1px solid #ddd;margin-bottom:22px;">'
        f'{sections}'
        '<p style="font-size:11px;color:#bbb;margin-top:20px;">Scored by Claude AI &nbsp;·&nbsp; Built by Azdhan for VGM</p>'
        '</body></html>'
    )


def send_digest(articles: list[dict]):
    """Send the digest email via Gmail SMTP to one or more recipients."""
    gmail_user = os.environ["GMAIL_ADDRESS"]
    gmail_password = os.environ["GMAIL_APP_PASSWORD"]
    raw = os.environ.get("DIGEST_RECIPIENT", gmail_user)

    recipients = [r.strip() for r in raw.split(",") if r.strip()]

    if not articles:
        print("No articles to send.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"News Digest — {date.today().strftime('%B %d, %Y')} ({len(articles)} articles)"
    msg["From"] = gmail_user
    msg["To"] = ", ".join(recipients)

    html = build_html(articles)
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(gmail_user, gmail_password)
        server.sendmail(gmail_user, recipients, msg.as_string())

    print(f"Digest sent to {recipients} with {len(articles)} articles.")
