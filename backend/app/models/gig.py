from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
from app.models.user import UserRole


class GigCategory(str, Enum):
    EDITING = "editing"
    PHOTOGRAPHY = "photography"
    PROMOTION = "promotion"


class GigStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Gig(Document):
    """Gig / task listing that can be posted by any role."""

    title: str
    description: str
    budget_min: float = 0
    budget_max: float = 0
    deadline: Optional[datetime] = None
    category: GigCategory = GigCategory.EDITING
    media_urls: List[str] = []
    posted_by: PydanticObjectId
    role_target: List[UserRole] = []
    status: GigStatus = GigStatus.OPEN
    is_review_ready: bool = False
    applicants: List[PydanticObjectId] = []
    accepted_user: Optional[PydanticObjectId] = None
    conversation_id: Optional[PydanticObjectId] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "gigs"
