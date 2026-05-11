from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    employee_id: str = Field(index=True, unique=True)
    email: str
    department: str
    role: UserRole = Field(default=UserRole.EMPLOYEE)
    password_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    embeddings: List["Embedding"] = Relationship(back_populates="user")
    logs: List["AttendanceLog"] = Relationship(back_populates="user")


class Embedding(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    vector_blob: bytes  # 512-dim vector serialized
    image_path: str

    user: User = Relationship(back_populates="embeddings")


class Camera(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    url: str  # RTSP or USB index
    roi_json: str = Field(default="{}")  # JSON string of coordinates
    is_active: bool = Field(default=True)

    logs: List["AttendanceLog"] = Relationship(back_populates="camera")


class CameraUpdate(SQLModel):
    name: Optional[str] = None
    url: Optional[str] = None
    roi_json: Optional[str] = None
    is_active: Optional[bool] = None


class AttendanceLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    camera_id: int = Field(foreign_key="camera.id")
    status: str  # IN or OUT
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    user: User = Relationship(back_populates="logs")
    camera: Camera = Relationship(back_populates="logs")


class SystemSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    org_name: str = Field(default="VisionAttend")
    late_threshold_minutes: int = Field(default=15)
    office_start_time: str = Field(default="09:00")
    office_end_time: str = Field(default="18:00")

    # SMTP Settings
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None
    sender_email: Optional[str] = None

    # Remote Enrollment
    allow_remote_enroll: bool = Field(default=True)
    require_approval: bool = Field(default=True)


class SystemSettingsUpdate(SQLModel):
    org_name: Optional[str] = None
    late_threshold_minutes: Optional[int] = None
    office_start_time: Optional[str] = None
    office_end_time: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_pass: Optional[str] = None
    sender_email: Optional[str] = None
    allow_remote_enroll: Optional[bool] = None
    require_approval: Optional[bool] = None


class EnrollmentRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: str
    name: str
    email: str
    department: str
    image_path: str
    status: str = Field(default="pending")  # pending, approved, rejected
    created_at: datetime = Field(default_factory=datetime.utcnow)
