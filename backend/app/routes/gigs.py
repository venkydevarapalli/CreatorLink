from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.gig import Gig, GigCategory, GigStatus
from app.models.user import User, UserRole
from app.models.conversation import Conversation
from app.auth.dependencies import get_current_user
from beanie import PydanticObjectId
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()


class CreateGigRequest(BaseModel):
    title: str
    description: str
    budget_min: float = 0
    budget_max: float = 0
    deadline: Optional[datetime] = None
    category: GigCategory = GigCategory.EDITING
    media_urls: List[str] = []
    role_target: List[UserRole] = []


class UpdateGigRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    deadline: Optional[datetime] = None
    category: Optional[GigCategory] = None
    media_urls: Optional[List[str]] = None
    status: Optional[GigStatus] = None


@router.get("")
async def list_gigs(
    user: User = Depends(get_current_user),
    category: Optional[GigCategory] = None,
    status: Optional[GigStatus] = None,
    budget_min: Optional[float] = None,
    budget_max: Optional[float] = None,
    role_target: Optional[UserRole] = None,
    posted_by: Optional[str] = None,
    q: Optional[str] = None,
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = {}
    if q:
        query["$or"] = [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}}
        ]
    if category:
        query["category"] = category.value

    
    if status:
        query["status"] = status.value
    if budget_min is not None:
        query.setdefault("budget_max", {})["$gte"] = budget_min
    if budget_max is not None:
        query.setdefault("budget_min", {})["$lte"] = budget_max
    if role_target:
        query["role_target"] = {"$in": [role_target.value]}
    if posted_by:
        query["posted_by"] = PydanticObjectId(posted_by)

    # Determine sort criteria
    sort_field = sort_by if sort_by in ["created_at", "budget_max", "budget_min"] else "created_at"
    sort_prefix = "-" if sort_order == "desc" else "+"
    
    gigs = await Gig.find(query).sort(f"{sort_prefix}{sort_field}").skip(skip).limit(limit).to_list()
    total = await Gig.find(query).count()

    results = []
    for g in gigs:
        gig_data = g.model_dump()
        gig_data["id"] = str(g.id)
        gig_data["posted_by"] = str(g.posted_by)
        gig_data["applicants"] = [str(a) for a in g.applicants]
        gig_data["accepted_user"] = str(g.accepted_user) if g.accepted_user else None
        gig_data["conversation_id"] = str(g.conversation_id) if g.conversation_id else None
        
        poster = await User.get(g.posted_by)
        if poster:
            gig_data["poster"] = {
                "id": str(poster.id),
                "display_name": poster.display_name,
                "avatar_url": poster.avatar_url,
                "role": poster.role.value,
            }
        results.append(gig_data)

    return {"gigs": results, "total": total}


@router.post("")
async def create_gig(data: CreateGigRequest, user: User = Depends(get_current_user)):
    # STRICT RULES:
    # 1. Brands can create all categories
    # 2. Influencers can only create Editing and Photography
    # 3. Editors and Photographers cannot create gigs
    
    if user.role in [UserRole.EDITOR, UserRole.PHOTOGRAPHER]:
        raise HTTPException(
            status_code=403,
            detail="Editors and Photographers cannot create gigs",
        )
    
    if user.role == UserRole.INFLUENCER:
        if data.category == GigCategory.PROMOTION:
            raise HTTPException(
                status_code=403,
                detail="Influencers cannot create Promotion gigs",
            )
    
    # Default category if none provided
    if not data.category:
        data.category = GigCategory.EDITING # Safe default

    gig = Gig(**data.model_dump(), posted_by=user.id)
    await gig.insert()
    result = gig.model_dump()
    result["id"] = str(gig.id)
    result["posted_by"] = str(gig.posted_by)
    return result


@router.get("/{gig_id}")
async def get_gig(gig_id: str):
    gig = await Gig.get(PydanticObjectId(gig_id))
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")

    gig_data = gig.model_dump()
    gig_data["id"] = str(gig.id)
    gig_data["posted_by"] = str(gig.posted_by)
    gig_data["applicants"] = [str(a) for a in gig.applicants]
    gig_data["accepted_user"] = str(gig.accepted_user) if gig.accepted_user else None
    gig_data["conversation_id"] = str(gig.conversation_id) if gig.conversation_id else None

    poster = await User.get(gig.posted_by)
    if poster:
        gig_data["poster"] = {
            "id": str(poster.id),
            "display_name": poster.display_name,
            "avatar_url": poster.avatar_url,
            "role": poster.role.value,
        }
    return gig_data


@router.put("/{gig_id}")
async def update_gig(
    gig_id: str, data: UpdateGigRequest, user: User = Depends(get_current_user)
):
    gig = await Gig.get(PydanticObjectId(gig_id))
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if str(gig.posted_by) != str(user.id) and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")

    for key, value in data.model_dump(exclude_none=True).items():
        setattr(gig, key, value)
    await gig.save()
    result = gig.model_dump()
    result["id"] = str(gig.id)
    return result


@router.delete("/{gig_id}")
async def delete_gig(gig_id: str, user: User = Depends(get_current_user)):
    gig = await Gig.get(PydanticObjectId(gig_id))
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if str(gig.posted_by) != str(user.id) and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    await gig.delete()
    return {"message": "Gig deleted"}


@router.post("/{gig_id}/apply")
async def apply_to_gig(gig_id: str, user: User = Depends(get_current_user)):
    gig = await Gig.get(PydanticObjectId(gig_id))
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if gig.status != GigStatus.OPEN:
        raise HTTPException(status_code=400, detail="Gig is not open")
    if user.id in gig.applicants:
        raise HTTPException(status_code=400, detail="Already applied")
    if gig.posted_by == user.id:
        raise HTTPException(status_code=400, detail="Cannot apply to own gig")

    gig.applicants.append(user.id)
    await gig.save()
    return {"message": "Applied successfully"}


@router.post("/{gig_id}/accept/{user_id}")
async def accept_applicant(
    gig_id: str, user_id: str, user: User = Depends(get_current_user)
):
    gig = await Gig.get(PydanticObjectId(gig_id))
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if str(gig.posted_by) != str(user.id):
        raise HTTPException(status_code=403, detail="Not authorized")

    applicant_id = PydanticObjectId(user_id)
    if applicant_id not in gig.applicants:
        raise HTTPException(status_code=400, detail="User has not applied")

    # Auto-create project conversation
    conversation = Conversation(
        participants=[user.id, applicant_id],
        is_group=False,
        project_id=gig.id,
        project_type="gig",
        created_by=user.id,
    )
    await conversation.insert()

    gig.accepted_user = applicant_id
    gig.conversation_id = conversation.id
    gig.status = GigStatus.IN_PROGRESS
    await gig.save()

    return {
        "message": "Applicant accepted",
        "conversation_id": str(conversation.id),
    }


@router.post("/{gig_id}/request_review")
async def request_review(gig_id: str, user: User = Depends(get_current_user)):
    gig = await Gig.get(PydanticObjectId(gig_id))
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if gig.accepted_user != user.id:
        raise HTTPException(status_code=403, detail="Only the accepted freelancer can submit work")
    if gig.status != GigStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Gig must be in progress")
    
    gig.is_review_ready = True
    await gig.save()
    return {"message": "Review requested"}


@router.post("/{gig_id}/complete")
async def complete_project(gig_id: str, user: User = Depends(get_current_user)):
    gig = await Gig.get(PydanticObjectId(gig_id))
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    if str(gig.posted_by) != str(user.id):
        raise HTTPException(status_code=403, detail="Only the poster can complete the project")
    
    gig.status = GigStatus.COMPLETED
    await gig.save()

    # Leave the conversation intact instead of deleting it.
    # Users can manually delete the chat if they choose to.
    
    return {"message": "Project completed and connection severed"}
