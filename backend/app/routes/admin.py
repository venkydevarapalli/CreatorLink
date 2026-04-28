from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.user import User, UserRole
from app.models.gig import Gig
from app.models.bid import Bid
from app.models.crew import CrewPost
from app.auth.dependencies import get_current_user
from beanie import PydanticObjectId
from typing import Optional

router = APIRouter()

async def get_admin_user(user: User = Depends(get_current_user)):
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def serialize_user(u):
    """Safely serialize a User document for JSON response."""
    return {
        "id": str(u.id),
        "email": u.email,
        "display_name": u.display_name,
        "role": u.role.value if hasattr(u.role, 'value') else str(u.role),
        "bio": u.bio,
        "avatar_url": u.avatar_url,
        "ratings": u.ratings,
        "total_ratings": u.total_ratings,
        "completed_projects": u.completed_projects,
        "is_active": u.is_active,
        "created_at": u.created_at.isoformat() if u.created_at else None,
    }


def serialize_gig(g, poster_name=None):
    """Safely serialize a Gig document for JSON response."""
    return {
        "id": str(g.id),
        "title": g.title,
        "description": g.description,
        "budget_min": g.budget_min,
        "budget_max": g.budget_max,
        "category": g.category.value if hasattr(g.category, 'value') else str(g.category),
        "status": g.status.value if hasattr(g.status, 'value') else str(g.status),
        "posted_by": str(g.posted_by),
        "poster_name": poster_name or "Unknown",
        "accepted_user": str(g.accepted_user) if g.accepted_user else None,
        "created_at": g.created_at.isoformat() if g.created_at else None,
    }


def serialize_crew(p, poster_name=None):
    """Safely serialize a CrewPost document for JSON response."""
    return {
        "id": str(p.id),
        "title": p.title,
        "production_name": p.production_name,
        "description": p.description,
        "status": p.status,
        "posted_by": str(p.posted_by),
        "poster_name": poster_name or "Unknown",
        "roles_needed": [{"title": r.title, "filled": r.filled} for r in (p.roles_needed or [])],
        "applicants": [{"user_id": str(a.user_id), "role_title": a.role_title, "status": a.status} for a in (p.applicants or [])],
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


@router.get("/users")
async def get_all_users(role: str = None, admin: User = Depends(get_admin_user)):
    query = {}
    if role:
        query["role"] = role
    users = await User.find(query).sort("-created_at").to_list()
    return [serialize_user(u) for u in users]


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: User = Depends(get_admin_user)):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await user.delete()
    return {"message": "User deleted"}


@router.get("/gigs")
async def get_all_gigs(admin: User = Depends(get_admin_user)):
    gigs = await Gig.find_all().sort("-created_at").to_list()
    results = []
    for g in gigs:
        poster = await User.get(g.posted_by)
        poster_name = poster.display_name if poster else "Deleted User"
        results.append(serialize_gig(g, poster_name))
    return results


@router.get("/crew")
async def get_all_crew(admin: User = Depends(get_admin_user)):
    posts = await CrewPost.find_all().sort("-created_at").to_list()
    results = []
    for p in posts:
        poster = await User.get(p.posted_by)
        poster_name = poster.display_name if poster else "Deleted User"
        results.append(serialize_crew(p, poster_name))
    return results


@router.get("/bids")
async def get_all_bids(admin: User = Depends(get_admin_user)):
    bids = await Bid.find_all().sort("-created_at").to_list()
    results = []
    for b in bids:
        bidder = await User.get(b.bidder_id)
        gig = await Gig.get(b.gig_id)
        results.append({
            "id": str(b.id),
            "amount": b.amount,
            "turnaround_days": b.turnaround_days,
            "message": b.message,
            "status": b.status.value if hasattr(b.status, 'value') else str(b.status),
            "counter_amount": b.counter_amount,
            "gig_id": str(b.gig_id),
            "gig_title": gig.title if gig else "Deleted Gig",
            "bidder_id": str(b.bidder_id),
            "bidder_name": bidder.display_name if bidder else "Deleted User",
            "bidder_role": (bidder.role.value if hasattr(bidder.role, 'value') else str(bidder.role)) if bidder else "unknown",
            "created_at": b.created_at.isoformat() if b.created_at else None,
        })
    return results


@router.delete("/bids/{bid_id}")
async def delete_bid(bid_id: str, admin: User = Depends(get_admin_user)):
    bid = await Bid.get(PydanticObjectId(bid_id))
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    await bid.delete()
    return {"message": "Bid removed by admin"}


@router.get("/analytics")
async def get_analytics(admin: User = Depends(get_admin_user)):
    total_users = await User.find_all().count()
    total_gigs = await Gig.find_all().count()
    total_crew = await CrewPost.find_all().count()
    total_bids = await Bid.find_all().count()
    completed_gigs = await Gig.find({"status": "completed"}).count()
    
    return {
        "total_users": total_users,
        "total_gigs": total_gigs,
        "total_crew": total_crew,
        "total_bids": total_bids,
        "completed_projects": completed_gigs,
    }


@router.delete("/gigs/{gig_id}")
async def delete_gig(gig_id: str, admin: User = Depends(get_admin_user)):
    gig = await Gig.get(PydanticObjectId(gig_id))
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    await gig.delete()
    return {"message": "Gig removed by admin"}


@router.delete("/crew/{post_id}")
async def delete_crew_post(post_id: str, admin: User = Depends(get_admin_user)):
    post = await CrewPost.get(PydanticObjectId(post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Crew post not found")
    await post.delete()
    return {"message": "Crew post removed by admin"}

