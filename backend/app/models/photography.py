from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import List
from datetime import datetime
from enum import Enum


class PackageCategory(str, Enum):
    PORTRAIT = "portrait"
    EVENT = "event"
    PRODUCT = "product"
    WEDDING = "wedding"
    FASHION = "fashion"
    LANDSCAPE = "landscape"
    COMMERCIAL = "commercial"
    OTHER = "other"


class ServicePackage(Document):
    """Photographer / videographer service package listing."""

    title: str
    description: str
    price: float
    portfolio_images: List[str] = []
    photographer_id: PydanticObjectId
    category: PackageCategory = PackageCategory.OTHER
    duration: str = ""
    deliverables: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "service_packages"
