from fastapi import APIRouter, HTTPException, Depends, Query
from app.models.conversation import Conversation
from app.models.message import Message, MessageType
from app.models.user import User
from app.auth.dependencies import get_current_user
from beanie import PydanticObjectId
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

router = APIRouter()


class CreateConversationRequest(BaseModel):
    participants: List[str]
    is_group: bool = False
    group_name: Optional[str] = None
    project_id: Optional[str] = None
    project_type: Optional[str] = None


class SendMessageRequest(BaseModel):
    content: str
    file_url: Optional[str] = None
    message_type: str = "text"


@router.get("")
async def list_conversations(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user: User = Depends(get_current_user),
):
    conversations = (
        await Conversation.find({"participants": {"$in": [user.id]}})
        .sort("-last_message_at")
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    result = []
    for conv in conversations:
        conv_data = conv.model_dump()
        conv_data["id"] = str(conv.id)
        conv_data["participants"] = [str(p) for p in conv.participants]
        conv_data["project_id"] = str(conv.project_id) if conv.project_id else None
        conv_data["created_by"] = str(conv.created_by) if conv.created_by else None

        # Participants info
        participants_info = []
        for pid in conv.participants:
            p_user = await User.get(pid)
            if p_user:
                participants_info.append(
                    {
                        "id": str(p_user.id),
                        "display_name": p_user.display_name,
                        "avatar_url": p_user.avatar_url,
                        "role": p_user.role.value,
                    }
                )
        conv_data["participants_info"] = participants_info

        # Unread count
        unread = await Message.find(
            {
                "conversation_id": conv.id,
                "sender_id": {"$ne": user.id},
                "read_by": {"$nin": [user.id]},
            }
        ).count()
        conv_data["unread_count"] = unread

        result.append(conv_data)

    return {"conversations": result}


@router.post("")
async def create_conversation(
    data: CreateConversationRequest, user: User = Depends(get_current_user)
):
    # STRICT RULE: Chat starts ONLY after bid is accepted.
    # We disable manual conversation creation for regular users.
    from app.models.user import UserRole
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Conversations can only be started by accepting a project bid.",
        )

    participants = [PydanticObjectId(p) for p in data.participants]
    if user.id not in participants:
        participants.append(user.id)

    # For 1-to-1, check if conversation already exists
    if not data.is_group and len(participants) == 2:
        existing = await Conversation.find_one(
            {
                "is_group": False,
                "participants": {"$all": participants, "$size": 2},
            }
        )
        if existing:
            result = existing.dict()
            result["id"] = str(existing.id)
            return result

    conversation = Conversation(
        participants=participants,
        is_group=data.is_group,
        group_name=data.group_name,
        project_id=PydanticObjectId(data.project_id) if data.project_id else None,
        project_type=data.project_type,
        created_by=user.id,
    )
    await conversation.insert()
    result = conversation.model_dump()
    result["id"] = str(conversation.id)
    result["participants"] = [str(p) for p in conversation.participants]
    result["project_id"] = str(conversation.project_id) if conversation.project_id else None
    return result

@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: str, user: User = Depends(get_current_user)
):
    conv = await Conversation.get(PydanticObjectId(conversation_id))
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if user.id not in conv.participants:
        raise HTTPException(status_code=403, detail="Not a participant")

    conv_data = conv.model_dump()
    conv_data["id"] = str(conv.id)
    conv_data["participants"] = [str(p) for p in conv.participants]
    conv_data["project_id"] = str(conv.project_id) if conv.project_id else None

    participants_info = []
    for pid in conv.participants:
        p_user = await User.get(pid)
        if p_user:
            participants_info.append(
                {
                    "id": str(p_user.id),
                    "display_name": p_user.display_name,
                    "avatar_url": p_user.avatar_url,
                    "role": p_user.role.value,
                }
            )
    conv_data["participants_info"] = participants_info
    return conv_data


@router.get("/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user: User = Depends(get_current_user),
):
    conv = await Conversation.get(PydanticObjectId(conversation_id))
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if user.id not in conv.participants:
        raise HTTPException(status_code=403, detail="Not a participant")

    messages = (
        await Message.find({"conversation_id": PydanticObjectId(conversation_id)})
        .sort("-created_at")
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    result = []
    for msg in messages:
        msg_data = msg.model_dump()
        msg_data["id"] = str(msg.id)
        msg_data["conversation_id"] = str(msg.conversation_id)
        msg_data["sender_id"] = str(msg.sender_id)
        msg_data["read_by"] = [str(u) for u in msg.read_by]
        sender = await User.get(msg.sender_id)
        if sender:
            msg_data["sender"] = {
                "id": str(sender.id),
                "display_name": sender.display_name,
                "avatar_url": sender.avatar_url,
            }
        result.append(msg_data)

    return {"messages": list(reversed(result)), "total": len(result)}


@router.post("/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    data: SendMessageRequest,
    user: User = Depends(get_current_user),
):
    conv = await Conversation.get(PydanticObjectId(conversation_id))
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if user.id not in conv.participants:
        raise HTTPException(status_code=403, detail="Not a participant")

    message = Message(
        conversation_id=PydanticObjectId(conversation_id),
        sender_id=user.id,
        content=data.content,
        file_url=data.file_url,
        message_type=MessageType(data.message_type),
        read_by=[user.id],
    )
    await message.insert()

    conv.last_message = data.content[:100]
    conv.last_message_at = datetime.utcnow()
    await conv.save()

    msg_data = message.model_dump()
    msg_data["id"] = str(message.id)
    msg_data["conversation_id"] = str(message.conversation_id)
    msg_data["sender_id"] = str(message.sender_id)
    msg_data["read_by"] = [str(u) for u in message.read_by]
    msg_data["sender"] = {
        "id": str(user.id),
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
    }
    return msg_data


@router.post("/{conversation_id}/read")
async def mark_as_read(
    conversation_id: str, user: User = Depends(get_current_user)
):
    conv = await Conversation.get(PydanticObjectId(conversation_id))
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    if user.id not in conv.participants:
        raise HTTPException(status_code=403, detail="Not a participant")

    unread_messages = await Message.find(
        {
            "conversation_id": PydanticObjectId(conversation_id),
            "sender_id": {"$ne": user.id},
            "read_by": {"$nin": [user.id]},
        }
    ).to_list()

    for msg in unread_messages:
        msg.read_by.append(user.id)
        msg.is_read = True
        await msg.save()

    return {"message": f"Marked {len(unread_messages)} messages as read"}


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str, user: User = Depends(get_current_user)
):
    conv = await Conversation.get(PydanticObjectId(conversation_id))
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    if user.id not in conv.participants and user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this chat")

    await Message.find({"conversation_id": conv.id}).delete()
    await conv.delete()

    return {"message": "Conversation and its messages deleted"}
