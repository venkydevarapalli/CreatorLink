from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from app.models.user import User, UserRole
from app.auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.auth.dependencies import get_current_user
from app.auth.oauth import (
    get_google_auth_url,
    exchange_code_for_token,
    get_google_user_info,
)
from app.config import settings
from fastapi.responses import RedirectResponse

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Request / Response Schemas ──────────────────────────────────────
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    display_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ── Endpoints ───────────────────────────────────────────────────────
@router.post("/register")
async def register(data: RegisterRequest):
    existing = await User.find_one(User.email == data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        hashed_password=pwd_context.hash(data.password),
        role=data.role,
        display_name=data.display_name,
    )
    await user.insert()

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    user_data = user.model_dump(exclude={"hashed_password"})
    user_data["id"] = str(user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_data,
    }


@router.post("/login")
async def login(data: LoginRequest):
    user = await User.find_one(User.email == data.email)
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    user_data = user.model_dump(exclude={"hashed_password"})
    user_data["id"] = str(user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_data,
    }


@router.post("/refresh")
async def refresh(data: RefreshRequest):
    payload = verify_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = await User.get(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    user_data = user.model_dump(exclude={"hashed_password"})
    user_data["id"] = str(user.id)
    return user_data


@router.get("/google")
async def google_auth():
    url = get_google_auth_url()
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(code: str):
    token_data = await exchange_code_for_token(code)
    access_token_google = token_data.get("access_token")
    if not access_token_google:
        raise HTTPException(
            status_code=400, detail="Failed to get token from Google"
        )

    user_info = await get_google_user_info(access_token_google)

    # Try to find existing user by Google ID or email
    user = await User.find_one(User.google_id == user_info["id"])
    if not user:
        user = await User.find_one(User.email == user_info["email"])
        if user:
            user.google_id = user_info["id"]
            await user.save()
        else:
            user = User(
                email=user_info["email"],
                google_id=user_info["id"],
                display_name=user_info.get("name", ""),
                avatar_url=user_info.get("picture", ""),
                role=UserRole.INFLUENCER,
            )
            await user.insert()

    access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return RedirectResponse(
        f"{settings.FRONTEND_URL}/auth/callback?access_token={access_token}&refresh_token={refresh_token}"
    )
