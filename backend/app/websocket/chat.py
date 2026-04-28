from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.auth.jwt_handler import verify_token
from app.models.conversation import Conversation
from app.models.message import Message, MessageType
from app.models.user import User
from beanie import PydanticObjectId
from datetime import datetime
import json

router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections per conversation."""

    def __init__(self):
        # {conversation_id: {user_id: websocket}}
        self.active_connections: dict[str, dict[str, WebSocket]] = {}
        # {user_id: set of conversation_ids} — for tracking unread across convos
        self.user_connections: dict[str, set] = {}

    async def connect(
        self, conversation_id: str, user_id: str, websocket: WebSocket
    ):
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = {}
        self.active_connections[conversation_id][user_id] = websocket

        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(conversation_id)

    def disconnect(self, conversation_id: str, user_id: str):
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].pop(user_id, None)
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]
        if user_id in self.user_connections:
            self.user_connections[user_id].discard(conversation_id)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def broadcast(
        self, conversation_id: str, message: dict, exclude_user: str = None
    ):
        if conversation_id in self.active_connections:
            disconnected = []
            for uid, ws in self.active_connections[conversation_id].items():
                if uid != exclude_user:
                    try:
                        await ws.send_json(message)
                    except Exception:
                        disconnected.append(uid)
            for uid in disconnected:
                self.disconnect(conversation_id, uid)


manager = ConnectionManager()


@router.websocket("/ws/chat/{conversation_id}")
async def websocket_chat(
    websocket: WebSocket,
    conversation_id: str,
    token: str = Query(None),
):
    # ── Authenticate ────────────────────────────────────────────────
    if not token:
        await websocket.close(code=4001, reason="Missing token")
        return

    payload = verify_token(token)
    if not payload:
        await websocket.close(code=4001, reason="Invalid token")
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=4001, reason="Invalid token")
        return

    # ── Verify participant ──────────────────────────────────────────
    conv = await Conversation.get(PydanticObjectId(conversation_id))
    if not conv or PydanticObjectId(user_id) not in conv.participants:
        await websocket.close(code=4003, reason="Not a participant")
        return

    user = await User.get(PydanticObjectId(user_id))
    if not user:
        await websocket.close(code=4001, reason="User not found")
        return

    await manager.connect(conversation_id, user_id, websocket)

    # Notify others
    await manager.broadcast(
        conversation_id,
        {
            "type": "user_joined",
            "user_id": user_id,
            "display_name": user.display_name,
        },
        exclude_user=user_id,
    )

    try:
        while True:
            data = await websocket.receive_text()
            msg_data = json.loads(data)

            if msg_data.get("type") == "message":
                # Persist message
                message = Message(
                    conversation_id=PydanticObjectId(conversation_id),
                    sender_id=PydanticObjectId(user_id),
                    content=msg_data.get("content", ""),
                    file_url=msg_data.get("file_url"),
                    message_type=MessageType(
                        msg_data.get("message_type", "text")
                    ),
                    read_by=[PydanticObjectId(user_id)],
                )
                await message.insert()

                # Update conversation last_message
                conv.last_message = msg_data.get("content", "")[:100]
                conv.last_message_at = datetime.utcnow()
                await conv.save()

                # Broadcast
                await manager.broadcast(
                    conversation_id,
                    {
                        "type": "new_message",
                        "message": {
                            "id": str(message.id),
                            "client_id": msg_data.get("client_id"), # Echo client id for deduping
                            "conversation_id": conversation_id,
                            "sender_id": user_id,
                            "sender_name": user.display_name,
                            "sender_avatar": user.avatar_url,
                            "content": message.content,
                            "file_url": message.file_url,
                            "message_type": message.message_type.value,
                            "created_at": message.created_at.isoformat(),
                        },
                    },
                )

            elif msg_data.get("type") == "typing":
                await manager.broadcast(
                    conversation_id,
                    {
                        "type": "typing",
                        "user_id": user_id,
                        "display_name": user.display_name,
                    },
                    exclude_user=user_id,
                )

            elif msg_data.get("type") == "stop_typing":
                await manager.broadcast(
                    conversation_id,
                    {"type": "stop_typing", "user_id": user_id},
                    exclude_user=user_id,
                )

            elif msg_data.get("type") == "read":
                unread = await Message.find(
                    {
                        "conversation_id": PydanticObjectId(conversation_id),
                        "sender_id": {"$ne": PydanticObjectId(user_id)},
                        "read_by": {"$nin": [PydanticObjectId(user_id)]},
                    }
                ).to_list()

                for msg in unread:
                    msg.read_by.append(PydanticObjectId(user_id))
                    msg.is_read = True
                    await msg.save()

                await manager.broadcast(
                    conversation_id,
                    {"type": "messages_read", "user_id": user_id},
                    exclude_user=user_id,
                )

    except WebSocketDisconnect:
        manager.disconnect(conversation_id, user_id)
        await manager.broadcast(
            conversation_id,
            {
                "type": "user_left",
                "user_id": user_id,
                "display_name": user.display_name,
            },
        )
    except Exception:
        manager.disconnect(conversation_id, user_id)
