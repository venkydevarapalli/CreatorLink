"""
Seed script - clears existing data and initializes a fresh database.
Run:  cd backend && python -m app.seed
"""
import asyncio
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


async def seed():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    await init_beanie(
        database=client[settings.DATABASE_NAME],
        document_models=[
            User, Gig, Bid, Plot, CrewPost,
            ServicePackage, Conversation, Message,
        ],
    )

    # Clear all collections
    for model in [Message, Conversation, Bid, Gig, Plot, CrewPost, ServicePackage, User]:
        count = await model.find_all().count()
        await model.find_all().delete()
        print(f"  Cleared {model.__name__}: {count} documents removed")

    print("\n[DONE] Database cleared! All collections are empty.")
    print("       Register new users at http://localhost:5173/signup")


if __name__ == "__main__":
    asyncio.run(seed())
