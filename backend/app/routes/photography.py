from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.photography import ServicePackage, PackageCategory
from app.models.user import User, UserRole
from app.auth.dependencies import get_current_user
from beanie import PydanticObjectId
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class CreatePackageRequest(BaseModel):
    title: str
    description: str
    price: float
    portfolio_images: List[str] = []
    category: PackageCategory = PackageCategory.OTHER
    duration: str = ""
    deliverables: str = ""


@router.get("")
async def list_packages(
    category: Optional[PackageCategory] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    photographer_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    query = {}
    if category:
        query["category"] = category.value
    if min_price is not None:
        query.setdefault("price", {})["$gte"] = min_price
    if max_price is not None:
        query.setdefault("price", {})["$lte"] = max_price
    if photographer_id:
        query["photographer_id"] = PydanticObjectId(photographer_id)

    packages = (
        await ServicePackage.find(query)
        .sort("-created_at")
        .skip(skip)
        .limit(limit)
        .to_list()
    )
    total = await ServicePackage.find(query).count()

    result = []
    for pkg in packages:
        pkg_data = pkg.model_dump()
        pkg_data["id"] = str(pkg.id)
        pkg_data["photographer_id"] = str(pkg.photographer_id)
        
        photographer = await User.get(pkg.photographer_id)
        if photographer:
            pkg_data["photographer"] = {
                "id": str(photographer.id),
                "display_name": photographer.display_name,
                "avatar_url": photographer.avatar_url,
            }
        result.append(pkg_data)

    return {"packages": result, "total": total}


@router.post("")
async def create_package(
    data: CreatePackageRequest, user: User = Depends(get_current_user)
):
    package = ServicePackage(**data.model_dump(), photographer_id=user.id)
    await package.insert()
    result = package.model_dump()
    result["id"] = str(package.id)
    result["photographer_id"] = str(package.photographer_id)
    return result


@router.get("/{package_id}")
async def get_package(package_id: str):
    package = await ServicePackage.get(PydanticObjectId(package_id))
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")

    pkg_data = package.model_dump()
    pkg_data["id"] = str(package.id)
    pkg_data["photographer_id"] = str(package.photographer_id)
    photographer = await User.get(package.photographer_id)
    if photographer:
        pkg_data["photographer"] = {
            "id": str(photographer.id),
            "display_name": photographer.display_name,
            "avatar_url": photographer.avatar_url,
            "ratings": photographer.ratings,
        }
    return pkg_data


@router.put("/{package_id}")
async def update_package(
    package_id: str,
    data: CreatePackageRequest,
    user: User = Depends(get_current_user),
):
    package = await ServicePackage.get(PydanticObjectId(package_id))
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    if package.photographer_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for key, value in data.dict().items():
        setattr(package, key, value)
    await package.save()
    result = package.dict()
    result["id"] = str(package.id)
    return result


@router.delete("/{package_id}")
async def delete_package(package_id: str, user: User = Depends(get_current_user)):
    package = await ServicePackage.get(PydanticObjectId(package_id))
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    if package.photographer_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    await package.delete()
    return {"message": "Package deleted"}
