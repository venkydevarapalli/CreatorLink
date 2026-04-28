from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from beanie import PydanticObjectId
from app.models.review import Review
from app.models.gig import Gig, GigStatus
from app.models.user import User
from app.auth.dependencies import get_current_user

router = APIRouter()

class CreateReviewRequest(BaseModel):
    gig_id: str
    reviewee_id: str
    rating: int
    feedback: str

@router.post("")
async def create_review(data: CreateReviewRequest, user: User = Depends(get_current_user)):
    gig = await Gig.get(PydanticObjectId(data.gig_id))
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if gig.status != GigStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Reviews can only be left on completed gigs")
    if user.id not in [gig.posted_by, gig.accepted_user]:
        raise HTTPException(status_code=403, detail="Not authorized to review this gig")
    
    existing = await Review.find_one({"gig_id": PydanticObjectId(data.gig_id), "reviewer_id": user.id})
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this gig")

    review = Review(
        gig_id=PydanticObjectId(data.gig_id),
        reviewer_id=user.id,
        reviewee_id=PydanticObjectId(data.reviewee_id),
        rating=data.rating,
        feedback=data.feedback
    )
    await review.insert()
    
    reviewee = await User.get(PydanticObjectId(data.reviewee_id))
    if reviewee:
        reviews = await Review.find({"reviewee_id": PydanticObjectId(data.reviewee_id)}).to_list()
        avg = sum([r.rating for r in reviews]) / len(reviews)
        reviewee.ratings = round(avg, 1)
        reviewee.total_ratings = len(reviews)
        await reviewee.save()
        
    return review.model_dump()

@router.get("/user/{user_id}")
async def get_user_reviews(user_id: str):
    reviews = await Review.find({"reviewee_id": PydanticObjectId(user_id)}).to_list()
    results = []
    for r in reviews:
        rd = r.model_dump()
        rd["id"] = str(r.id)
        reviewer = await User.get(r.reviewer_id)
        rd["reviewer"] = {
            "id": str(reviewer.id) if reviewer else None,
            "display_name": reviewer.display_name if reviewer else "Unknown",
        }
        results.append(rd)
    return results
