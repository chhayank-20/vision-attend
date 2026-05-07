from sqlmodel import Session, select
from app.models.database import engine
from app.models.schemas import User, UserRole
from app.core.security import get_password_hash

def create_initial_admin():
    """Creates a default admin user if none exists in the database."""
    with Session(engine) as session:
        admin = session.exec(select(User).where(User.role == UserRole.ADMIN)).first()
        if not admin:
            admin_user = User(
                name="System Administrator",
                employee_id="admin",
                email="admin@visionattend.local",
                department="IT",
                role=UserRole.ADMIN,
                password_hash=get_password_hash("admin123") # Default password
            )
            session.add(admin_user)
            session.commit()
            print("👤 Initial Admin Created: ID: admin | Pass: admin123")

def create_initial_settings():
    """Creates default system settings if none exist."""
    from app.models.schemas import SystemSettings
    with Session(engine) as session:
        settings = session.exec(select(SystemSettings)).first()
        if not settings:
            default_settings = SystemSettings(
                org_name="VisionAttend",
                late_threshold_minutes=15,
                office_start_time="09:00",
                office_end_time="18:00"
            )
            session.add(default_settings)
            session.commit()
            print("⚙️ Default System Settings Initialized.")
