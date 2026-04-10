from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./pitwall.db"
    OPENF1_API_URL: str = "https://api.openf1.org/v1"

    YOUTUBE_API_KEY: str = ""
    CHANNEL_ID: str = ""

    POLL_INTERVAL_SECONDS: int = 2
    WEBSOCKET_UPDATE_INTERVAL_SECONDS: int = 3

    OPENF1_MAX_CONCURRENCY: int = 2
    OPENF1_MAX_RETRIES: int = 3
    OPENF1_INITIAL_BACKOFF_SECONDS: float = 0.5
    OPENF1_BACKOFF_MULTIPLIER: float = 2.0
    OPENF1_TIMEOUT_SECONDS: float = 15.0

    POSITION_CACHE_TTL_SECONDS: int = 2
    LAP_CACHE_TTL_SECONDS: int = 4
    WEATHER_CACHE_TTL_SECONDS: int = 5
    EVENT_CACHE_TTL_SECONDS: int = 5
    SESSION_CACHE_TTL_SECONDS: int = 30
    UNSTABLE_ENDPOINT_COOLDOWN_SECONDS: int = 60

    class Config:
        env_file = ".env"

settings = Settings()
