from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import Optional, List
from datetime import datetime


class Conversation(Document):
    """Chat conversation – supports 1-to-1 and group chats, optionally linked to a project."""

    participants: List[PydanticObjectId]
    is_group: bool = False
    group_name: Optional[str] = None
    project_id: Optional[PydanticObjectId] = None
    project_type: Optional[str] = None  # gig | plot | crew | bid_negotiation
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    created_by: Optional[PydanticObjectId] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "conversations"
