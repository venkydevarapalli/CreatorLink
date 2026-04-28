from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.plot import Plot, AccessRequest
from app.models.user import User, UserRole
from app.models.conversation import Conversation
from app.auth.dependencies import get_current_user
from beanie import PydanticObjectId
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()


class CreatePlotRequest(BaseModel):
    title: str
    synopsis: str
    full_content: str
    genre: str = ""
    is_private: bool = True
    media_urls: List[str] = []


class UpdatePlotRequest(BaseModel):
    title: Optional[str] = None
    synopsis: Optional[str] = None
    full_content: Optional[str] = None
    genre: Optional[str] = None
    is_private: Optional[bool] = None
    media_urls: Optional[List[str]] = None


@router.get("")
async def list_plots(
    genre: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
):
    query = {
        "$or": [
            {"is_private": False},
            {"owner_id": user.id},
            {"access_granted": {"$in": [user.id]}},
        ]
    }
    if genre:
        query["genre"] = genre

    plots = await Plot.find(query).sort("-created_at").skip(skip).limit(limit).to_list()
    total = await Plot.find(query).count()

    results = []
    for p in plots:
        pd = p.model_dump()
        pd["id"] = str(p.id)
        pd["owner_id"] = str(p.owner_id)
        pd["access_granted"] = [str(u) for u in p.access_granted]
        pd["conversation_id"] = str(p.conversation_id) if p.conversation_id else None
        
        owner = await User.get(p.owner_id)
        if owner:
            pd["owner"] = {
                "id": str(owner.id),
                "display_name": owner.display_name,
                "avatar_url": owner.avatar_url,
            }
        results.append(pd)

    return {"plots": results, "total": total}


@router.post("")
async def create_plot(
    data: CreatePlotRequest, user: User = Depends(get_current_user)
):
    plot = Plot(**data.model_dump(), owner_id=user.id)
    await plot.insert()
    result = plot.model_dump()
    result["id"] = str(plot.id)
    result["owner_id"] = str(plot.owner_id)
    return result


@router.get("/{plot_id}")
async def get_plot(plot_id: str, user: User = Depends(get_current_user)):
    plot = await Plot.get(PydanticObjectId(plot_id))
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")

    has_access = (
        not plot.is_private
        or plot.owner_id == user.id
        or user.id in plot.access_granted
        or user.role == UserRole.ADMIN
    )

    if not has_access:
        return {
            "id": str(plot.id),
            "title": plot.title,
            "synopsis": plot.synopsis,
            "genre": plot.genre,
            "is_private": plot.is_private,
            "owner_id": str(plot.owner_id),
            "view_count": plot.view_count,
            "has_access": False,
            "access_requested": any(
                ar.user_id == user.id for ar in plot.access_requests
            ),
        }

    plot.view_count += 1
    await plot.save()

    plot_data = plot.model_dump()
    plot_data["id"] = str(plot.id)
    plot_data["owner_id"] = str(plot.owner_id)
    plot_data["access_granted"] = [str(u) for u in plot.access_granted]
    plot_data["conversation_id"] = str(plot.conversation_id) if plot.conversation_id else None
    plot_data["has_access"] = True

    owner = await User.get(plot.owner_id)
    if owner:
        plot_data["owner"] = {
            "id": str(owner.id),
            "display_name": owner.display_name,
            "avatar_url": owner.avatar_url,
        }
    return plot_data


@router.put("/{plot_id}")
async def update_plot(
    plot_id: str, data: UpdatePlotRequest, user: User = Depends(get_current_user)
):
    plot = await Plot.get(PydanticObjectId(plot_id))
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
    if plot.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for key, value in data.dict(exclude_none=True).items():
        setattr(plot, key, value)
    await plot.save()
    result = plot.dict()
    result["id"] = str(plot.id)
    return result


@router.delete("/{plot_id}")
async def delete_plot(plot_id: str, user: User = Depends(get_current_user)):
    plot = await Plot.get(PydanticObjectId(plot_id))
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
    if plot.owner_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    await plot.delete()
    return {"message": "Plot deleted"}


@router.post("/{plot_id}/request-access")
async def request_access(plot_id: str, user: User = Depends(get_current_user)):
    plot = await Plot.get(PydanticObjectId(plot_id))
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
    if plot.owner_id == user.id:
        raise HTTPException(status_code=400, detail="You own this plot")
    if user.id in plot.access_granted:
        raise HTTPException(status_code=400, detail="Access already granted")
    if any(ar.user_id == user.id for ar in plot.access_requests):
        raise HTTPException(status_code=400, detail="Request already pending")

    plot.access_requests.append(AccessRequest(user_id=user.id))
    await plot.save()
    return {"message": "Access requested"}


@router.post("/{plot_id}/grant-access/{user_id}")
async def grant_access(
    plot_id: str, user_id: str, user: User = Depends(get_current_user)
):
    plot = await Plot.get(PydanticObjectId(plot_id))
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
    if plot.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    target_id = PydanticObjectId(user_id)

    for ar in plot.access_requests:
        if ar.user_id == target_id:
            ar.status = "approved"
            break

    if target_id not in plot.access_granted:
        plot.access_granted.append(target_id)

    # Create or update plot discussion conversation
    if not plot.conversation_id:
        conversation = Conversation(
            participants=[user.id, target_id],
            is_group=len(plot.access_granted) > 1,
            group_name=f"Plot: {plot.title}" if len(plot.access_granted) > 1 else None,
            project_id=plot.id,
            project_type="plot",
            created_by=user.id,
        )
        await conversation.insert()
        plot.conversation_id = conversation.id
    else:
        conversation = await Conversation.get(plot.conversation_id)
        if conversation and target_id not in conversation.participants:
            conversation.participants.append(target_id)
            if len(conversation.participants) > 2:
                conversation.is_group = True
                conversation.group_name = f"Plot: {plot.title}"
            await conversation.save()

    await plot.save()
    return {
        "message": "Access granted",
        "conversation_id": str(plot.conversation_id),
    }


@router.post("/{plot_id}/reject-access/{user_id}")
async def reject_access(
    plot_id: str, user_id: str, user: User = Depends(get_current_user)
):
    plot = await Plot.get(PydanticObjectId(plot_id))
    if not plot:
        raise HTTPException(status_code=404, detail="Plot not found")
    if plot.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    target_id = PydanticObjectId(user_id)
    for ar in plot.access_requests:
        if ar.user_id == target_id:
            ar.status = "rejected"
            break

    await plot.save()
    return {"message": "Access rejected"}
