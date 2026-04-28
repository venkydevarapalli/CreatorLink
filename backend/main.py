from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.config import settings
from app.routes import auth, users, gigs, bids, conversations, upload, admin, reviews
from app.websocket.chat import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="CreatorLink API",
    description="Social media collaboration platform for creative professionals",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── REST API Routes ──────────────────────────────────────────────────
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(gigs.router, prefix="/gigs", tags=["Gigs"])
app.include_router(bids.router, prefix="/bids", tags=["Bids"])
app.include_router(conversations.router, prefix="/conversations", tags=["Conversations"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])

# ── WebSocket Route ──────────────────────────────────────────────────
app.include_router(ws_router)


@app.get("/")
async def root():
    return {"message": "CreatorLink API", "version": "1.0.0", "docs": "/docs"}
