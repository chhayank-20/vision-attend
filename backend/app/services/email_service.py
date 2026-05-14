import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from sqlmodel import Session, select
from app.models.database import engine
from app.models.schemas import SystemSettings
from app.core.crypto import decrypt_string

logger = logging.getLogger("vision-attend.email")

class EmailService:
    def _get_settings(self) -> Optional[SystemSettings]:
        with Session(engine) as session:
            return session.exec(select(SystemSettings)).first()

    def send_email(self, to_email: str, subject: str, body: str, is_html: bool = False):
        """Generic method to send an email using saved system settings."""
        settings = self._get_settings()
        if not settings or not settings.smtp_host:
            logger.warning("SMTP not configured. Skipping email delivery.")
            return False

        try:
            msg = MIMEMultipart()
            msg["From"] = settings.sender_email
            msg["To"] = to_email
            msg["Subject"] = subject

            msg.attach(MIMEText(body, "html" if is_html else "plain"))

            # Connect and send
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
                if settings.smtp_user and settings.smtp_pass:
                    real_pass = decrypt_string(settings.smtp_pass)
                    if real_pass == "[DECRYPTION_ERROR]":
                        logger.error("Failed to decrypt SMTP password.")
                        return False
                    
                    server.starttls()
                    server.login(settings.smtp_user, real_pass)
                
                server.send_message(msg)
                logger.info(f"Email sent successfully to {to_email}")
                return True
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    def send_welcome_email(self, user_name: str, to_email: str):
        subject = "Welcome to VisionAttend!"
        body = f"""
        <html>
            <body style="font-family: sans-serif; color: #334155;">
                <h2 style="color: #2563eb;">Welcome to VisionAttend, {user_name}!</h2>
                <p>Your enrollment request has been <strong>approved</strong>.</p>
                <p>You can now use your face for seamless attendance tracking at any of our authorized cameras.</p>
                <br/>
                <p style="font-size: 0.875rem; color: #64748b;">This is an automated message. Please do not reply.</p>
            </body>
        </html>
        """
        return self.send_email(to_email, subject, body, is_html=True)

    def send_rejection_email(self, user_name: str, to_email: str):
        subject = "VisionAttend Enrollment Update"
        body = f"""
        <html>
            <body style="font-family: sans-serif; color: #334155;">
                <h2 style="color: #e11d48;">Enrollment Update</h2>
                <p>Hello {user_name},</p>
                <p>Unfortunately, your enrollment request was not approved at this time.</p>
                <p>This is usually due to a low-quality photo or the face not being clearly visible. Please try submitting a new request with a clearer, well-lit photo.</p>
                <br/>
                <p style="font-size: 0.875rem; color: #64748b;">If you believe this was a mistake, please contact your administrator.</p>
            </body>
        </html>
        """
        return self.send_email(to_email, subject, body, is_html=True)

email_service = EmailService()
