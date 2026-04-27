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
