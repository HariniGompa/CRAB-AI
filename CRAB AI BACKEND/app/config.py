from typing import Optional
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    app_name: str = "CRAB AI"
    app_version: str = "1.0.0"
    debug: bool = False
    database_url: str = "sqlite:///./crab_ai.db"
    jwt_secret_key: str = "change-this-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 1440

    # Supabase
    supabase_jwt_secret: Optional[str] = None
    supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None

    # Groq AI (primary - higher rate limits, free)
    # Get key at: https://console.groq.com
    groq_api_key: Optional[str] = None

    # Gemini AI (fallback)
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.0-flash"

    # File storage
    upload_dir: str = "app/static/uploads"
    resume_dir: str = "app/static/resumes"
    portfolio_dir: str = "app/static/portfolios"
    max_file_size: int = 5 * 1024 * 1024
    max_resumes_per_user: int = 10

    # Email
    smtp_server: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"

settings = Settings()
