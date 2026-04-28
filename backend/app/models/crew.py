from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CrewRole(BaseModel):
    """A single role needed for a production."""

    title: str
    description: str = ""
    filled: bool = False
    hired_user_id: Optional[PydanticObjectId] = None


class Applicant(BaseModel):
    """Embedded applicant for a crew post."""

    user_id: PydanticObjectId
    role_title: str
    message: str = ""
    status: str = "pending"  # pending | hired | rejected
    applied_at: datetime = Field(default_factory=datetime.utcnow)


class CrewPost(Document):
    """Crew hiring post – directors recruit editors, photographers, actors, etc."""

    title: str
    production_name: str
    description: str
    roles_needed: List[CrewRole] = []
    posted_by: PydanticObjectId
    applicants: List[Applicant] = []
    hired: List[PydanticObjectId] = []
    conversation_id: Optional[PydanticObjectId] = None
    status: str = "open"  # open | in_production | completed
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "crew_posts"
