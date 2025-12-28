"""
Webhook Module
--------------
Handles incoming webhook events from external services and triggers internal processing.

Responsibilities:
- Flask route for webhook POST
- Payload validation and normalization
- Asynchronous processing hooks
- Logging and monitoring
- Metrics collection
- Supports multiple event types
"""

import logging
import json
import threading
import time
from flask import request, jsonify

# -----------------------------------------------------------------------------
# Logger Configuration
# -----------------------------------------------------------------------------
logger = logging.getLogger("WebhookHandler")
logger.setLevel(logging.INFO)

_ch = logging.StreamHandler()
_formatter = logging.Formatter("[%(asctime)s] %(levelname)s :: %(message)s")
_ch.setFormatter(_formatter)
logger.addHandler(_ch)

# -----------------------------------------------------------------------------
# Webhook Manager
# -----------------------------------------------------------------------------
class WebhookHandler:
    """
    Main class for processing webhook events.
    """

    def __init__(self):
        self.metrics = {
            "events_received": 0,
            "events_processed": 0,
            "events_failed": 0
        }
        logger.info("WebhookHandler initialized")

    # -------------------------------------------------------------------------
    # Route Registration
    # -------------------------------------------------------------------------
    def bootstrap_webhooks(self, app):
        """
        Register Flask routes for webhooks
        """
        @app.route("/webhook", methods=["POST"])
        def webhook_endpoint():
            self.metrics["events_received"] += 1
            try:
                payload = request.get_json(force=True)
                logger.info(f"Received webhook payload: {json.dumps(payload)}")
                self._validate_payload(payload)

                # Process asynchronously
                thread = threading.Thread(target=self._process_event, args=(payload,))
                thread.start()

                return jsonify({"status": "accepted"}), 202

            except Exception as e:
                self.metrics["events_failed"] += 1
                logger.error(f"Webhook processing failed: {e}")
                return jsonify({"status": "error", "message": str(e)}), 400

    # -------------------------------------------------------------------------
    # Event Processing
    # -------------------------------------------------------------------------
    def _process_event(self, payload):
        """
        Process webhook payload asynchronously
        """
        try:
            event_type = payload.get("event_type", "generic")
            logger.debug(f"Processing event type: {event_type}")
            time.sleep(0.1)  # simulate processing

            # Dispatch to event-specific handler
            if event_type == "song_update":
                self._handle_song_update(payload)
            elif event_type == "playlist_update":
                self._handle_playlist_update(payload)
            else:
                self._handle_generic(payload)

            self.metrics["events_processed"] += 1

        except Exception as e:
            self.metrics["events_failed"] += 1
            logger.exception(f"Error processing webhook: {e}")

    # -------------------------------------------------------------------------
    # Payload Validation
    # -------------------------------------------------------------------------
    def _validate_payload(self, payload):
        """
        Ensure payload contains required fields
        """
        if not isinstance(payload, dict):
            raise ValueError("Payload must be a JSON object")
        if "event_type" not in payload:
            raise ValueError("Missing 'event_type' field")
        if "data" not in payload:
            raise ValueError("Missing 'data' field")
        logger.debug("Payload validation passed")

    # -------------------------------------------------------------------------
    # Event Handlers
    # -------------------------------------------------------------------------
    def _handle_song_update(self, payload):
        """
        Handle song update events
        """
        data = payload.get("data", {})
        song_title = data.get("title", "Unknown Song")
        logger.info(f"Song update event: {song_title}")

    def _handle_playlist_update(self, payload):
        """
        Handle playlist update events
        """
        data = payload.get("data", {})
        playlist_name = data.get("name", "Unknown Playlist")
        logger.info(f"Playlist update event: {playlist_name}")

    def _handle_generic(self, payload):
        """
        Handle other generic events
        """
        logger.info(f"Generic webhook event received: {payload}")

    # -------------------------------------------------------------------------
    # Metrics / Observability
    # -------------------------------------------------------------------------
    def get_metrics(self):
        """
        Return metrics for monitoring
        """
        return self.metrics

    # -------------------------------------------------------------------------
    # Utility / Helpers
    # -------------------------------------------------------------------------
    def simulate_event(self, event_type="generic", data=None):
        """
        Utility to simulate incoming webhook event
        """
        payload = {"event_type": event_type, "data": data or {}}
        self._process_event(payload)
