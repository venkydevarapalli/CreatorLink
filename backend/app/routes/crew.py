from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.crew import CrewPost, CrewRole, Applicant
from app.models.user import User, UserRole
from app.models.conversation import Conversation
from app.auth.dependencies import get_current_user
from beanie import PydanticObjectId
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class CrewRoleRequest(BaseModel):
    title: str
    description: str = ""


class CreateCrewPostRequest(BaseModel):
    title: str
    production_name: str
    description: str
    roles_needed: List[CrewRoleRequest] = []


class ApplyRequest(BaseModel):
    role_title: str
    message: str = ""


@router.get("")
async def list_crew_posts(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = {}
    if status:
        query["status"] = status
    else:
        query["status"] = "open"

    posts = (
        await CrewPost.find(query).sort("-created_at").skip(skip).limit(limit).to_list()
    )
    total = await CrewPost.find(query).count()

    result = []
    for post in posts:
        post_data = post.model_dump()
        post_data["id"] = str(post.id)
        post_data["posted_by"] = str(post.posted_by)
        post_data["hired"] = [str(h) for h in post.hired]
        post_data["conversation_id"] = str(post.conversation_id) if post.conversation_id else None
        
        poster = await User.get(post.posted_by)
        if poster:
            post_data["poster"] = {
                "id": str(poster.id),
                "display_name": poster.display_name,
                "avatar_url": poster.avatar_url,
                "role": poster.role.value,
            }
        result.append(post_data)

    return {"crew_posts": result, "total": total}


@router.post("")
async def create_crew_post(
    data: CreateCrewPostRequest, user: User = Depends(get_current_user)
):
    roles = [CrewRole(**r.dict()) for r in data.roles_needed]
    post = CrewPost(
        title=data.title,
        production_name=data.production_name,
        description=data.description,
        roles_needed=roles,
        posted_by=user.id,
    )
    await post.insert()
    result = post.model_dump()
    result["id"] = str(post.id)
    result["posted_by"] = str(post.posted_by)
    return result


@router.get("/{post_id}")
async def get_crew_post(post_id: str):
    post = await CrewPost.get(PydanticObjectId(post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Crew post not found")

    post_data = post.model_dump()
    post_data["id"] = str(post.id)
    post_data["posted_by"] = str(post.posted_by)
    post_data["hired"] = [str(h) for h in post.hired]
    post_data["conversation_id"] = str(post.conversation_id) if post.conversation_id else None

    poster = await User.get(post.posted_by)
    if poster:
        post_data["poster"] = {
            "id": str(poster.id),
            "display_name": poster.display_name,
            "avatar_url": poster.avatar_url,
            "role": poster.role.value,
        }

    # Enrich applicant data
    enriched = []
    for applicant in post.applicants:
        app_data = applicant.model_dump()
        app_data["user_id"] = str(applicant.user_id)
        app_user = await User.get(applicant.user_id)
        if app_user:
            app_data["user"] = {
                "id": str(app_user.id),
                "display_name": app_user.display_name,
                "avatar_url": app_user.avatar_url,
                "role": app_user.role.value,
            }
        enriched.append(app_data)
    post_data["applicants"] = enriched

    return post_data


@router.delete("/{post_id}")
async def delete_crew_post(post_id: str, user: User = Depends(get_current_user)):
    post = await CrewPost.get(PydanticObjectId(post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Crew post not found")
    if post.posted_by != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    await post.delete()
    return {"message": "Crew post deleted"}


@router.post("/{post_id}/apply")
async def apply_to_crew(
    post_id: str, data: ApplyRequest, user: User = Depends(get_current_user)
):
    post = await CrewPost.get(PydanticObjectId(post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Crew post not found")
    if post.posted_by == user.id:
        raise HTTPException(status_code=400, detail="Cannot apply to own post")
    if any(a.user_id == user.id for a in post.applicants):
        raise HTTPException(status_code=400, detail="Already applied")

    post.applicants.append(
        Applicant(user_id=user.id, role_title=data.role_title, message=data.message)
    )
    await post.save()
    return {"message": "Applied successfully"}


@router.post("/{post_id}/hire/{user_id}")
async def hire_applicant(
    post_id: str, user_id: str, user: User = Depends(get_current_user)
):
    post = await CrewPost.get(PydanticObjectId(post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Crew post not found")
    if post.posted_by != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    target_id = PydanticObjectId(user_id)

    found = False
    for applicant in post.applicants:
        if applicant.user_id == target_id:
            applicant.status = "hired"
            found = True
            # Fill the matching role
            for role in post.roles_needed:
                if role.title == applicant.role_title and not role.filled:
                    role.filled = True
                    role.hired_user_id = target_id
                    break
            break

    if not found:
        raise HTTPException(status_code=400, detail="User has not applied")

    if target_id not in post.hired:
        post.hired.append(target_id)

    # Create or update production group chat
    if not post.conversation_id:
        conversation = Conversation(
            participants=[user.id, target_id],
            is_group=True,
            group_name=f"Production: {post.production_name}",
            project_id=post.id,
            project_type="crew",
            created_by=user.id,
        )
        await conversation.insert()
        post.conversation_id = conversation.id
    else:
        conversation = await Conversation.get(post.conversation_id)
        if conversation and target_id not in conversation.participants:
            conversation.participants.append(target_id)
            await conversation.save()

    await post.save()

    return {
        "message": "Applicant hired",
        "conversation_id": str(post.conversation_id),
    }
