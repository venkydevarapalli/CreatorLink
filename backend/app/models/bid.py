from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import Optional
from datetime import datetime
from enum import Enum


class BidStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COUNTERED = "countered"
    WITHDRAWN = "withdrawn"


class Bid(Document):
    """A bid submitted by a user on a gig."""

    gig_id: PydanticObjectId
    bidder_id: PydanticObjectId
    amount: float
    turnaround_days: int
    message: str = ""
    status: BidStatus = BidStatus.PENDING
    counter_amount: Optional[float] = None
    conversation_id: Optional[PydanticObjectId] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "bids"
