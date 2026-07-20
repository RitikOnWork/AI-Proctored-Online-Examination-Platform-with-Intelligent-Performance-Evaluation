import json
import logging
import datetime
import uuid
from typing import Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy import select
from app.database import SessionLocal

from app.models.exam_sessions import ExamSession, SessionStatus
from app.models.proctor_events import ProctorEvent, ProctorEventType

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Real-Time Proctoring WebSockets"])

# Connection manager to maintain active WebSocket connections per session
class ConnectionManager:
    def __init__(self):
        # session_id -> WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        # Single Active Session Enforcement: If connection already exists for this session, disconnect old socket
        if session_id in self.active_connections:
            old_socket = self.active_connections[session_id]
            try:
                await old_socket.send_json({
                    "type": "SESSION_TERMINATED",
                    "reason": "New session initiated from another device or tab."
                })
                await old_socket.close(code=4001, reason="Duplicate active session.")
            except Exception:
                pass
        self.active_connections[session_id] = websocket
        logger.info(f"WebSocket connected for session: {session_id}")

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_connections and self.active_connections[session_id] == websocket:
            del self.active_connections[session_id]
            logger.info(f"WebSocket disconnected for session: {session_id}")

    async def send_message(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)


manager = ConnectionManager()


@router.websocket("/ws/proctor/{session_id}")
async def proctor_websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    
    suspicion_score = 0.0
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
            except Exception:
                continue

            msg_type = payload.get("type", "").upper()

            # 1. 10-Second Heartbeat check
            if msg_type in ["HEARTBEAT", "PING"]:
                await websocket.send_json({
                    "type": "PONG",
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "suspicion_score": round(suspicion_score, 1)
                })
                continue

            # 2. Real-time Proctor Event Alert
            if msg_type == "PROCTOR_EVENT":
                event_type_str = payload.get("event_type", "tab_switched").lower()
                confidence = float(payload.get("confidence", 1.0))
                details = payload.get("details", "Real-time proctor audit event.")

                # Calculate suspicion score increment
                weight = 1.0
                if "face" in event_type_str:
                    weight = 2.5
                elif "gaze" in event_type_str:
                    weight = 1.5
                elif "multiple" in event_type_str:
                    weight = 3.0
                    
                suspicion_score += (confidence * weight * 10)

                # Persist event to Database
                async with SessionLocal() as db:

                    try:
                        s_uuid = uuid.UUID(session_id)
                        try:
                            e_enum = ProctorEventType(event_type_str)
                        except ValueError:
                            e_enum = ProctorEventType.TAB_SWITCHED

                        p_event = ProctorEvent(
                            session_id=s_uuid,
                            event_type=e_enum,
                            confidence=confidence,
                            details=details,
                            timestamp=datetime.datetime.now(datetime.timezone.utc)
                        )
                        db.add(p_event)
                        await db.commit()
                    except Exception as err:
                        logger.error(f"Error persisting proctor event via WS: {err}")

                # Respond with updated suspicion score
                await websocket.send_json({
                    "type": "EVENT_ACKNOWLEDGED",
                    "event_type": event_type_str,
                    "total_suspicion_score": round(suspicion_score, 1),
                    "warning_required": suspicion_score > 30.0
                })

    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket error in session {session_id}: {e}")
        manager.disconnect(session_id, websocket)
