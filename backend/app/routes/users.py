from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.user import User, UserRole
from app.auth.dependencies import get_current_user, role_required
from beanie import PydanticObjectId
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class UpdateProfileRequest(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    portfolio_urls: Optional[List[str]] = None
    portfolio_images: Optional[List[str]] = None
    location: Optional[str] = None
    skills: Optional[List[str]] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None


@router.get("")
async def list_users(
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = {}
    if role:
        query["role"] = role.value
    if search:
        query["display_name"] = {"$regex": search, "$options": "i"}

    users = await User.find(query).skip(skip).limit(limit).to_list()
    total = await User.find(query).count()

    return {
        "users": [
            {**u.model_dump(exclude={"hashed_password"}), "id": str(u.id)} for u in users
        ],
        "total": total,
    }


@router.get("/{user_id}")
async def get_user(user_id: str):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    data = user.model_dump(exclude={"hashed_password"})
    data["id"] = str(user.id)
    return data


@router.put("/me")
async def update_profile(
    data: UpdateProfileRequest, user: User = Depends(get_current_user)
):
    update_data = data.model_dump(exclude_none=True)
    if update_data:
        for key, value in update_data.items():
            setattr(user, key, value)
        await user.save()
    result = user.model_dump(exclude={"hashed_password"})
    result["id"] = str(user.id)
    return result


@router.delete("/{user_id}")
async def delete_user(
    user_id: str, admin: User = Depends(role_required([UserRole.ADMIN]))
):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.delete()
    return {"message": "User deleted"}
