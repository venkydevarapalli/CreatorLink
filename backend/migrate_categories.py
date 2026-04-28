"""
One-time migration script: maps old gig categories to new strict enum values.
Run from the backend directory:  python migrate_categories.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "creatorlink"

# Map every old category value → new enum value
CATEGORY_MAP = {
    "photo_editing": "editing",
    "video_editing": "editing",
    "audio_editing": "editing",
    "graphic_design": "editing",
    "web_design": "editing",
    "animation": "editing",
    "other": "editing",           # catch-all → editing
    "content_creation": "promotion",
    "social_media": "promotion",
    "marketing": "promotion",
    "seo": "promotion",
    "photography": "photography",
    "videography": "photography",
    "photo_shoot": "photography",
    # already-correct values (no-ops)
    "editing": "editing",
    "promotion": "promotion",
}


async def migrate():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    gigs = db["gigs"]

    total_fixed = 0
    for old_val, new_val in CATEGORY_MAP.items():
        if old_val == new_val:
            continue
        result = await gigs.update_many(
            {"category": old_val},
            {"$set": {"category": new_val}},
        )
        if result.modified_count:
            print(f"  '{old_val}' → '{new_val}'  ({result.modified_count} docs)")
            total_fixed += result.modified_count

    # Anything still unknown → default to 'editing'
    result = await gigs.update_many(
        {"category": {"$nin": ["editing", "photography", "promotion"]}},
        {"$set": {"category": "editing"}},
    )
    if result.modified_count:
        print(f"  unknown categories → 'editing'  ({result.modified_count} docs)")
        total_fixed += result.modified_count

    print(f"\nMigration complete. Total documents updated: {total_fixed}")
    client.close()


asyncio.run(migrate())
