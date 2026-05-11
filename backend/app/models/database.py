import os
from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# Render provides postgres:// urls, but SQLAlchemy requires postgresql://
database_url = settings.DATABASE_URL
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# SQLite needs check_same_thread=False, but Postgres does not
connect_args = {}
if database_url and database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(database_url, connect_args=connect_args)


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
