from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PlacementPro"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    MONGODB_URL: str = "mongodb://localhost:27017/placementpro"

    # SMTP Email settings (set in .env for real emails)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""          # e.g. yourapp@gmail.com
    SMTP_PASSWORD: str = ""      # App password (not account password)
    SMTP_FROM: str = ""          # Display sender, defaults to SMTP_USER

    class Config:
        env_file = ".env"

settings = Settings()
