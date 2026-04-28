from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings
from app.models.user import User
from app.models.gig import Gig
from app.models.bid import Bid
from app.models.plot import Plot
from app.models.crew import CrewPost
from app.models.photography import ServicePackage
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.review import Review


async def init_db():
    """Initialize MongoDB connection and Beanie ODM."""
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=5000,
        )
        # Test the connection
        await client.admin.command("ping")

        await init_beanie(
            database=client[settings.DATABASE_NAME],
            document_models=[
                User,
                Gig,
                Bid,
                Plot,
                CrewPost,
                ServicePackage,
                Conversation,
                Message,
                Review,
            ],
        )
        print(f"[OK] Connected to MongoDB: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"[ERROR] MongoDB connection failed: {e}")
        print(f"   URL: {settings.MONGODB_URL}")
        print("   Make sure MongoDB is running, or set MONGODB_URL to a MongoDB Atlas URI.")
        print("   Free Atlas cluster: https://www.mongodb.com/cloud/atlas/register")
        raise
