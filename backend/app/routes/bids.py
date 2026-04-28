from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.bid import Bid, BidStatus
from app.models.gig import Gig, GigStatus
from app.models.user import User, UserRole
from app.models.conversation import Conversation
from app.auth.dependencies import get_current_user
from beanie import PydanticObjectId
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()


class CreateBidRequest(BaseModel):
    gig_id: str
    amount: float
    turnaround_days: int
    message: str = ""


class CounterBidRequest(BaseModel):
    counter_amount: float


@router.post("")
async def create_bid(data: CreateBidRequest, user: User = Depends(get_current_user)):
    # STRICT BIDDING RULES:
    # 1. Influencers can ONLY bid on 'promotion' gigs from 'brands'
    # 2. Editors/Photographers can ONLY bid on 'editing' or 'photography' gigs
    
    gig = await Gig.get(PydanticObjectId(data.gig_id))
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")

    from app.models.gig import GigCategory
    
    if user.role == UserRole.INFLUENCER:
        # Check poster role
        poster = await User.get(gig.posted_by)
        if not poster or poster.role != UserRole.BRAND:
             raise HTTPException(
                status_code=403,
                detail="Influencers can only bid on gigs posted by Brands",
            )
        if gig.category != GigCategory.PROMOTION:
            raise HTTPException(
                status_code=403,
                detail="Influencers can only bid on Promotion gigs",
            )
            
    elif user.role == UserRole.EDITOR:
        if gig.category != GigCategory.EDITING:
            raise HTTPException(
                status_code=403,
                detail="Editors can only bid on Editing gigs",
            )
    elif user.role == UserRole.PHOTOGRAPHER:
        if gig.category != GigCategory.PHOTOGRAPHY:
            raise HTTPException(
                status_code=403,
                detail="Photographers can only bid on Photography gigs",
            )
    else:
        # Brands and Admins usually don't bid, but if they try, we check permissions
        if user.role == UserRole.BRAND:
            raise HTTPException(status_code=403, detail="Brands cannot place bids")

    if gig.posted_by == user.id:
        raise HTTPException(status_code=400, detail="Cannot bid on own gig")

    existing = await Bid.find_one(
        {
            "gig_id": PydanticObjectId(data.gig_id),
            "bidder_id": user.id,
            "status": BidStatus.PENDING.value,
        }
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already have a pending bid")

    # Create bid negotiation conversation
    conversation = Conversation(
        participants=[gig.posted_by, user.id],
        is_group=False,
        project_id=gig.id,
        project_type="bid_negotiation",
        created_by=user.id,
    )
    await conversation.insert()

    bid = Bid(
        gig_id=PydanticObjectId(data.gig_id),
        bidder_id=user.id,
        amount=data.amount,
        turnaround_days=data.turnaround_days,
        message=data.message,
        conversation_id=conversation.id,
    )
    await bid.insert()

    result = bid.model_dump()
    result["id"] = str(bid.id)
    result["gig_id"] = str(bid.gig_id)
    result["bidder_id"] = str(bid.bidder_id)
    result["conversation_id"] = str(conversation.id)
    return result


@router.get("")
async def list_my_bids(
    status: Optional[BidStatus] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
):
    query = {"bidder_id": user.id}
    if status:
        query["status"] = status.value

    bids = await Bid.find(query).sort("-created_at").skip(skip).limit(limit).to_list()
    total = await Bid.find(query).count()

    result = []
    for bid in bids:
        bid_data = bid.model_dump()
        bid_data["id"] = str(bid.id)
        bid_data["gig_id"] = str(bid.gig_id)
        bid_data["bidder_id"] = str(bid.bidder_id)
        bid_data["conversation_id"] = str(bid.conversation_id) if bid.conversation_id else None
        gig = await Gig.get(bid.gig_id)
        if gig:
            gig_dict = gig.model_dump()
            gig_dict["id"] = str(gig.id)
            gig_dict["posted_by"] = str(gig.posted_by)
            bid_data["gig"] = gig_dict
        result.append(bid_data)

    return {"bids": result, "total": total}


@router.get("/gig/{gig_id}")
async def list_bids_for_gig(
    gig_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
):
    gig = await Gig.get(PydanticObjectId(gig_id))
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if str(gig.posted_by) != str(user.id) and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    bids = (
        await Bid.find({"gig_id": PydanticObjectId(gig_id)})
        .sort("-created_at")
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    total = await Bid.find({"gig_id": PydanticObjectId(gig_id)}).count()

    result = []
    for bid in bids:
        bid_data = bid.model_dump()
        bid_data["id"] = str(bid.id)
        bid_data["gig_id"] = str(bid.gig_id)
        bid_data["bidder_id"] = str(bid.bidder_id)
        bid_data["conversation_id"] = str(bid.conversation_id) if bid.conversation_id else None
        bidder = await User.get(bid.bidder_id)
        if bidder:
            bid_data["bidder"] = {
                "id": str(bidder.id),
                "display_name": bidder.display_name,
                "avatar_url": bidder.avatar_url,
                "role": bidder.role.value,
                "ratings": bidder.ratings,
                "completed_projects": bidder.completed_projects,
            }
        result.append(bid_data)

    return {"bids": result, "total": total}


@router.put("/{bid_id}/accept")
async def accept_bid(bid_id: str, user: User = Depends(get_current_user)):
    bid = await Bid.get(PydanticObjectId(bid_id))
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    gig = await Gig.get(bid.gig_id)
    if not gig or str(gig.posted_by) != str(user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Create project conversation
    conversation = Conversation(
        participants=[user.id, bid.bidder_id],
        is_group=False,
        project_id=gig.id,
        project_type="gig",
        created_by=user.id,
    )
    await conversation.insert()

    bid.status = BidStatus.ACCEPTED
    bid.conversation_id = conversation.id
    await bid.save()

    gig.accepted_user = bid.bidder_id
    gig.conversation_id = conversation.id
    gig.status = GigStatus.IN_PROGRESS
    await gig.save()

    # Reject other pending bids
    other_bids = await Bid.find(
        {
            "gig_id": gig.id,
            "_id": {"$ne": bid.id},
            "status": BidStatus.PENDING.value,
        }
    ).to_list()
    for other in other_bids:
        other.status = BidStatus.REJECTED
        await other.save()

    return {"message": "Bid accepted", "conversation_id": str(conversation.id)}


@router.put("/{bid_id}/reject")
async def reject_bid(bid_id: str, user: User = Depends(get_current_user)):
    bid = await Bid.get(PydanticObjectId(bid_id))
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    gig = await Gig.get(bid.gig_id)
    if not gig or str(gig.posted_by) != str(user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    bid.status = BidStatus.REJECTED
    await bid.save()
    return {"message": "Bid rejected"}


@router.put("/{bid_id}/counter")
async def counter_bid(
    bid_id: str, data: CounterBidRequest, user: User = Depends(get_current_user)
):
    bid = await Bid.get(PydanticObjectId(bid_id))
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")

    gig = await Gig.get(bid.gig_id)
    if not gig or str(gig.posted_by) != str(user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    bid.status = BidStatus.COUNTERED
    bid.counter_amount = data.counter_amount
    await bid.save()

    result = bid.model_dump()
    result["id"] = str(bid.id)
    result["gig_id"] = str(bid.gig_id)
    result["bidder_id"] = str(bid.bidder_id)
    result["conversation_id"] = str(bid.conversation_id) if bid.conversation_id else None
    return {"message": "Counter offer sent", "bid": result}
