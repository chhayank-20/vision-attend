from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "VisionAttend"
    DATABASE_URL: str = "sqlite:///./vision_attend.db"
    SECRET_KEY: str = "your-secret-key-change-it"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ENCRYPTION_KEY: str = "32-byte-base64-key-placeholder="
    
    # AWS SES Settings (Optional initially)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    SENDER_EMAIL: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
