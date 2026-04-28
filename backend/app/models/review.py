from beanie import Document, PydanticObjectId
from pydantic import Field
from datetime import datetime

class Review(Document):
    gig_id: PydanticObjectId
    reviewer_id: PydanticObjectId
    reviewee_id: PydanticObjectId
    rating: int = Field(ge=1, le=5)
    feedback: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reviews"
