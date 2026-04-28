from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb+srv://venkydevarapalli:venky123@creatorlink.cycngvj.mongodb.net/?appName=CreatorLink"
    DATABASE_NAME: str = "CreatorLink"
    JWT_SECRET: str = "change-this-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CLOUDINARY_CLOUD_NAME: str = "dmheyxyrr"
    CLOUDINARY_API_KEY: str = "445357511255696"
    CLOUDINARY_API_SECRET: str = "6o0N6e_EDHunn3v7OrYfOnFWGwc"
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/auth/google/callback"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = Path(__file__).resolve().parent.parent / ".env"


settings = Settings()
