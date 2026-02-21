"""
Async email utility using Python's smtplib over TLS.
Configure SMTP credentials in .env or environment variables.
"""
import smtplib
import asyncio
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List
from app.core.config import settings


def _send_sync(to_emails: List[str], subject: str, html_body: str) -> None:
    """Synchronous SMTP send — called from a thread pool."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"[EMAIL SKIP] SMTP not configured. Would have sent to {to_emails}: {subject}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
    msg["To"] = ", ".join(to_emails)
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USER, to_emails, msg.as_string())
        print(f"[EMAIL SENT] {subject} → {to_emails}")
    except Exception as e:
        print(f"[EMAIL ERROR] Failed to send email: {e}")


async def send_email(to_emails: List[str], subject: str, html_body: str) -> None:
    """Async wrapper around the synchronous SMTP call."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _send_sync, to_emails, subject, html_body)


# ── Email Templates ─────────────────────────────────────────────────────────

def build_drive_eligibility_email(student_name: str, company: str, role: str,
                                   drive_date: str, salary: str, min_cgpa: float,
                                   portal_url: str = "http://localhost:5173") -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:28px 32px;color:white">
        <h1 style="margin:0;font-size:22px">🎯 You're Eligible for a Placement Drive!</h1>
        <p style="margin:8px 0 0;opacity:.9">PlacementPro — Campus Career Suite</p>
      </div>
      <div style="padding:28px 32px;background:#f9fafb">
        <p style="color:#374151">Hi <strong>{student_name}</strong>,</p>
        <p style="color:#374151">Great news! You meet the eligibility criteria for the following drive:</p>
        <div style="background:white;border-radius:8px;padding:20px;border-left:4px solid #3b82f6;margin:16px 0">
          <h2 style="margin:0 0 8px;color:#1e40af">{company}</h2>
          <p style="margin:4px 0;color:#6b7280"><strong>Role:</strong> {role}</p>
          <p style="margin:4px 0;color:#6b7280"><strong>Package:</strong> {salary}</p>
          <p style="margin:4px 0;color:#6b7280"><strong>Drive Date:</strong> {drive_date}</p>
          <p style="margin:4px 0;color:#6b7280"><strong>Min CGPA Required:</strong> {min_cgpa}</p>
        </div>
        <p style="color:#374151">Log in to your student portal to apply now before the deadline!</p>
        <a href="{portal_url}/student/drives" style="display:inline-block;background:#3b82f6;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px">Apply Now →</a>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:12px">This is an automated notification from PlacementPro. Please do not reply to this email.</p>
      </div>
    </div>
    """


def build_aptitude_result_email(student_name: str, company: str, score: float,
                                 cutoff: float, passed: bool) -> str:
    status_color = "#10b981" if passed else "#ef4444"
    status_text = "✅ Qualified for Next Round" if passed else "❌ Not Qualified for Next Round"
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#8b5cf6,#ec4899);padding:28px 32px;color:white">
        <h1 style="margin:0;font-size:22px">📊 Aptitude Test Results</h1>
        <p style="margin:8px 0 0;opacity:.9">{company} — PlacementPro</p>
      </div>
      <div style="padding:28px 32px;background:#f9fafb">
        <p style="color:#374151">Hi <strong>{student_name}</strong>,</p>
        <p style="color:#374151">Your aptitude test results for the <strong>{company}</strong> placement drive are ready:</p>
        <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;text-align:center">
          <div style="font-size:48px;font-weight:bold;color:{status_color}">{score:.1f}</div>
          <div style="color:#6b7280;margin-top:4px">Your Score (Cutoff: {cutoff})</div>
          <div style="margin-top:12px;padding:8px 20px;background:{status_color}20;color:{status_color};border-radius:20px;display:inline-block;font-weight:bold">{status_text}</div>
        </div>
        {'<p style="color:#374151">Congratulations! Prepare for the interview round. Check your portal for the schedule.</p>' if passed else '<p style="color:#374151">Keep practicing and look out for more drive opportunities in your portal.</p>'}
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:12px">PlacementPro automated notification. Please do not reply.</p>
      </div>
    </div>
    """


def build_selection_email(student_name: str, company: str, role: str, salary: str) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#10b981,#059669);padding:28px 32px;color:white">
        <h1 style="margin:0;font-size:22px">🎉 Congratulations! You've Been Selected!</h1>
        <p style="margin:8px 0 0;opacity:.9">PlacementPro — Campus Career Suite</p>
      </div>
      <div style="padding:28px 32px;background:#f9fafb">
        <p style="color:#374151">Dear <strong>{student_name}</strong>,</p>
        <p style="color:#374151">We are thrilled to inform you that you have been <strong style="color:#10b981">SELECTED</strong> for the following position:</p>
        <div style="background:white;border-radius:8px;padding:24px;border-left:4px solid #10b981;margin:16px 0;text-align:center">
          <h2 style="margin:0 0 8px;color:#065f46;font-size:24px">{company}</h2>
          <p style="margin:4px 0;color:#6b7280;font-size:16px"><strong>{role}</strong></p>
          <p style="margin:8px 0 0;color:#10b981;font-size:18px;font-weight:bold">📦 {salary}</p>
        </div>
        <p style="color:#374151">Your TPO office will share further details about the joining process and offer letter. Please check your campus portal and email regularly.</p>
        <p style="color:#374151"><strong>Well done — you earned it! 🌟</strong></p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
        <p style="color:#9ca3af;font-size:12px">PlacementPro automated notification. Please do not reply.</p>
      </div>
    </div>
    """
