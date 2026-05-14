from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.models.database import get_session
from app.models.schemas import SystemSettings, SystemSettingsUpdate, UserRole, User
from app.api.deps import get_current_user
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.crypto import encrypt_string, decrypt_string

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/", response_model=SystemSettings)
def get_settings(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Retrieves the current system settings."""
    settings = session.exec(select(SystemSettings)).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")

    # Mask password before returning to UI
    if settings.smtp_pass:
        settings.smtp_pass = "********"
    return settings


@router.patch("/", response_model=SystemSettings)
def update_settings(
    settings_update: SystemSettingsUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Updates the system settings (Admin only)."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can update settings")

    db_settings = session.exec(select(SystemSettings)).first()
    if not db_settings:
        raise HTTPException(status_code=404, detail="Settings not found")

    update_data = settings_update.model_dump(exclude_unset=True)
    if "smtp_pass" in update_data and update_data["smtp_pass"]:
        update_data["smtp_pass"] = encrypt_string(update_data["smtp_pass"])

    for key, value in update_data.items():
        setattr(db_settings, key, value)

    session.add(db_settings)
    session.commit()
    session.refresh(db_settings)

    # Mask password before returning to UI
    if db_settings.smtp_pass:
        db_settings.smtp_pass = "********"
    return db_settings


@router.post("/test-email")
def test_email(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Sends a test email to the current user to verify SMTP settings."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    from app.services.email_service import email_service
    
    subject = "VisionAttend SMTP Test"
    body = f"Hello {current_user.name},\n\nThis is a test email from your VisionAttend system. Your SMTP settings are correctly configured!"
    
    success = email_service.send_email(current_user.email, subject, body)
    
    if success:
        return {"message": f"Test email sent successfully to {current_user.email}"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send test email. Check server logs for details.")
