from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MessageType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    SYSTEM = "system"


class Message(Document):
    """A single message within a conversation."""

    conversation_id: PydanticObjectId
    sender_id: PydanticObjectId
    content: str = ""
    file_url: Optional[str] = None
    message_type: MessageType = MessageType.TEXT
    is_read: bool = False
    read_by: List[PydanticObjectId] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "messages"
