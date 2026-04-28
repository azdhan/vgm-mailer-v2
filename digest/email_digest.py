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
        cards = ""
        for a in items:
            score = a.get("score", 3)
            if score == 5:
                score_color = "#2e7d32"
                score_bg = "#f9fbe7"
                score_border = "#c8e6c9"
                score_sub = "#81c784"
            elif score == 4:
                score_color = "#388e3c"
                score_bg = "#f9fbe7"
                score_border = "#c8e6c9"
                score_sub = "#81c784"
            else:
                score_color = "#bf360c"
                score_bg = "#fff8f6"
                score_border = "#ffccbc"
                score_sub = "#ff8a65"

            cards += f"""
            <div style="background:#ffffff;border:1px solid #ece8e1;border-radius:8px;padding:16px 18px;margin-bottom:8px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:14px;">
                <div style="flex:1;">
                  <a href="{a['url']}" style="color:#1a1a1a;text-decoration:none;font-size:14px;font-weight:700;line-height:1.5;display:block;margin-bottom:8px;">{a['title']}</a>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:12px;font-weight:700;color:#555;">{a.get('source','Unknown')}</span>
                    <span style="color:#ddd;font-size:10px;">|</span>
                    <span style="font-size:11px;color:#aaa;font-style:italic;">{a.get('reason','')}</span>
                  </div>
                </div>
                <div style="flex-shrink:0;border:1px solid {score_border};background:{score_bg};border-radius:6px;padding:7px 11px;text-align:center;min-width:36px;">
                  <div style="font-size:16px;font-weight:800;color:{score_color};line-height:1;">{score}</div>
                  <div style="font-size:8px;color:{score_sub};text-transform:uppercase;letter-spacing:0.5px;">/5</div>
                </div>
              </div>
            </div>"""

        sections += f"""
        <div style="margin-bottom:28px;">
          <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:10px;">
            <span style="font-size:11px;font-weight:800;color:#1a1a1a;text-transform:uppercase;letter-spacing:1.8px;">{keyword}</span>
            <span style="font-size:11px;color:#ccc;">{len(items)} article{"s" if len(items) != 1 else ""}</span>
          </div>
          <div style="height:1px;background:#e8e3dc;margin-bottom:14px;"></div>
          {cards}
        </div>"""

    html = f"""
    <html>
    <body style="margin:0;padding:0;background:#f0ede8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:28px 16px;">
        <tr><td align="center">
          <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

            <!-- Header -->
            <tr>
              <td style="background:#ffffff;padding:28px 28px 20px;border-radius:10px 10px 0 0;border:1px solid #e8e3dc;border-bottom:none;">
                <div style="font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#b89a6a;margin-bottom:10px;">Daily Briefing</div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="vertical-align:bottom;">
                      <div style="font-size:28px;font-weight:800;color:#1a1a1a;letter-spacing:-1px;line-height:1;">News Digest</div>
                      <div style="font-size:12px;color:#bbb;margin-top:5px;letter-spacing:0.3px;">{today}</div>
                    </td>
                    <td align="right" style="vertical-align:bottom;">
                      <div style="font-size:32px;font-weight:800;color:#1a1a1a;line-height:1;">{total}</div>
                      <div style="font-size:10px;color:#bbb;text-transform:uppercase;letter-spacing:1.5px;margin-top:2px;">Articles Today</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Accent line -->
            <tr><td style="background:#b89a6a;height:2px;"></td></tr>

            <!-- Body -->
            <tr>
              <td style="background:#fafaf8;padding:28px 28px 8px;border:1px solid #e8e3dc;border-top:none;border-bottom:none;">
                {sections}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#ffffff;padding:16px 28px;border-radius:0 0 10px 10px;border:1px solid #e8e3dc;border-top:1px solid #ece8e1;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:11px;color:#ccc;">Scored by Claude AI &nbsp;·&nbsp; Articles below 3/5 filtered</td>
                    <td align="right" style="font-size:11px;color:#aaa;">Built by <span style="color:#b89a6a;font-weight:700;">Azdhan</span> for VGM</td>
                  </tr>
                </table>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>"""
    return html


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
