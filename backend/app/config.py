from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # Use SQLite for local execution
    DATABASE_URL: str = "sqlite+aiosqlite:///./pitwall.db"
    OPENF1_API_URL: str = "https://api.openf1.org/v1"

    YOUTUBE_API_KEY: str 
    CHANNEL_ID: str

    POLL_INTERVAL_SECONDS: int = 2

    class Config:
        env_file = ".env"

settings = Settings()
