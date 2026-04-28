from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AccessRequest(BaseModel):
    """Embedded model for plot access requests."""

    user_id: PydanticObjectId
    status: str = "pending"  # pending | approved | rejected
    requested_at: datetime = Field(default_factory=datetime.utcnow)


class Plot(Document):
    """StorySecure plot – directors' protected story content."""

    title: str
    synopsis: str
    full_content: str
    genre: str = ""
    is_private: bool = True
    owner_id: PydanticObjectId
    access_granted: List[PydanticObjectId] = []
    access_requests: List[AccessRequest] = []
    view_count: int = 0
    conversation_id: Optional[PydanticObjectId] = None
    media_urls: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "plots"
