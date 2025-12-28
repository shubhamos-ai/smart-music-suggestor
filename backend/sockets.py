"""
Sockets Module
--------------
Handles real-time communication between clients and the backend using WebSockets.

Responsibilities:
- Initialize SocketIO with Flask app
- Manage user connections and disconnections
- Broadcast events to multiple clients
- Provide real-time suggestion updates
- Track metrics for observability
"""

import logging
from flask_socketio import SocketIO, emit, join_room, leave_room
from typing import Dict, List

# -----------------------------------------------------------------------------
# Logger Configuration
# -----------------------------------------------------------------------------
logger = logging.getLogger("Sockets")
logger.setLevel(logging.INFO)

_ch = logging.StreamHandler()
_formatter = logging.Formatter("[%(asctime)s] %(levelname)s :: %(message)s")
_ch.setFormatter(_formatter)
logger.addHandler(_ch)

# -----------------------------------------------------------------------------
# Socket Manager
# -----------------------------------------------------------------------------
class SocketManager:
    """
    Manages SocketIO connections and real-time events.
    """

    def __init__(self, app=None):
        """
        Initialize SocketIO with optional Flask app
        """
        self.socketio = SocketIO(app, cors_allowed_origins="*") if app else SocketIO(cors_allowed_origins="*")
        self.connected_clients: Dict[str, str] = {}  # sid -> username
        self.metrics: Dict[str, int] = {"connections": 0, "disconnections": 0, "events_received": 0}
        logger.info("SocketManager initialized")
        if app:
            self._register_events()

    # -------------------------------------------------------------------------
    # Event Registration
    # -------------------------------------------------------------------------
    def _register_events(self):
        """
        Register default socket event handlers
        """
        @self.socketio.on("connect")
        def handle_connect():
            sid = self.socketio.server.eio_sid
            self.metrics["connections"] += 1
            logger.info(f"Client connected: {sid}")
            emit("connected", {"message": "Welcome to SHUBHAMOS Auto Suggestor"})

        @self.socketio.on("disconnect")
        def handle_disconnect():
            sid = self.socketio.server.eio_sid
            self.metrics["disconnections"] += 1
            self.connected_clients.pop(sid, None)
            logger.info(f"Client disconnected: {sid}")

        @self.socketio.on("join_room")
        def handle_join_room(data):
            room = data.get("room", "global")
            username = data.get("username", "anonymous")
            join_room(room)
            self.connected_clients[self.socketio.server.eio_sid] = username
            emit("room_joined", {"room": room, "username": username}, room=room)
            logger.info(f"{username} joined room {room}")

        @self.socketio.on("leave_room")
        def handle_leave_room(data):
            room = data.get("room", "global")
            username = self.connected_clients.get(self.socketio.server.eio_sid, "anonymous")
            leave_room(room)
            emit("room_left", {"room": room, "username": username}, room=room)
            logger.info(f"{username} left room {room}")

        @self.socketio.on("suggestion_update")
        def handle_suggestion_update(data):
            self.metrics["events_received"] += 1
            query = data.get("query", "")
            room = data.get("room", "global")
            suggestions = self.generate_suggestions(query)
            emit("suggestions", {"query": query, "results": suggestions}, room=room)
            logger.debug(f"Broadcasted suggestions for query '{query}' to room {room}")

    # -------------------------------------------------------------------------
    # Suggestion Logic
    # -------------------------------------------------------------------------
    def generate_suggestions(self, query: str) -> List[Dict]:
        """
        Generate a list of suggestion dictionaries based on a query.
        """
        suggestions: List[Dict] = []
        for i in range(5):
            suggestions.append({
                "title": f"{query} song {i+1}",
                "video_id": f"{query[:3]}_{i}",
                "thumbnail": f"https://i.ytimg.com/vi/{query[:3]}_{i}/default.jpg"
            })
        return suggestions

    # -------------------------------------------------------------------------
    # Metrics / Observability
    # -------------------------------------------------------------------------
    def get_metrics(self) -> Dict[str, int]:
        """
        Return socket metrics for monitoring
        """
        return self.metrics

    # -------------------------------------------------------------------------
    # Utility / Helpers
    # -------------------------------------------------------------------------
    def broadcast_message(self, message: str, room: str = "global"):
        """
        Broadcast a plain text message to a room
        """
        emit("broadcast", {"message": message}, room=room)
        logger.debug(f"Broadcasted message to room {room}: {message}")

    def start(self):
        """
        Start the SocketIO server (blocking)
        """
        logger.info("Starting SocketIO server")
        self.socketio.run(debug=True)
