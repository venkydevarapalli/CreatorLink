from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from app.auth.dependencies import get_current_user
from app.models.user import User
from app.config import settings

router = APIRouter()


@router.post("")
async def upload_file(
    file: UploadFile = File(...), user: User = Depends(get_current_user)
):
    """Upload a file to Cloudinary (or return placeholder if not configured)."""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    # Read to check size, then reset cursor
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    await file.seek(0)

    # Try Cloudinary upload
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
        try:
            import cloudinary
            import cloudinary.uploader

            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET,
            )

            result = cloudinary.uploader.upload(
                file.file,
                folder="creatorlink",
                resource_type="auto",
            )

            return {
                "url": result["secure_url"],
                "public_id": result["public_id"],
                "format": result.get("format"),
                "resource_type": result.get("resource_type"),
            }
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Upload failed: {str(e)}"
            )

    # Fallback: return a placeholder URL
    return {
        "url": f"https://placehold.co/600x400?text={file.filename}",
        "public_id": f"placeholder_{file.filename}",
        "format": "png",
        "resource_type": "image",
        "note": "Cloudinary not configured – using placeholder",
    }
