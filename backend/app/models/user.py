from beanie import Document
from pydantic import Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    BRAND = "brand"
    INFLUENCER = "influencer"
    EDITOR = "editor"
    PHOTOGRAPHER = "photographer"
    ADMIN = "admin"


class User(Document):
    """User document – supports all 6 platform roles."""

    email: EmailStr
    hashed_password: Optional[str] = None
    role: UserRole
    display_name: str
    bio: str = ""
    avatar_url: str = ""
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    portfolio_urls: List[str] = []
    portfolio_images: List[str] = []
    location: str = ""
    skills: List[str] = []
    website: str = ""
    instagram: str = ""
    twitter: str = ""
    ratings: float = 0.0
    total_ratings: int = 0
    completed_projects: int = 0
    google_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
