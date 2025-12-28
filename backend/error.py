"""
Error Handling Module
--------------------
Centralized error and exception management.

Responsibilities:
- Register Flask error handlers
- Define custom exceptions
- Logging and observability hooks
- Optional recovery actions
- Provides structure for production-level reliability
"""

import logging
from flask import jsonify, request

# -----------------------------------------------------------------------------
# Logger Configuration
# -----------------------------------------------------------------------------
logger = logging.getLogger("ErrorHandler")
logger.setLevel(logging.INFO)

_ch = logging.StreamHandler()
_formatter = logging.Formatter("[%(asctime)s] %(levelname)s :: %(message)s")
_ch.setFormatter(_formatter)
logger.addHandler(_ch)

# -----------------------------------------------------------------------------
# Custom Exceptions
# -----------------------------------------------------------------------------

class SuggestionAPIError(Exception):
    """Raised when there is a critical failure in the suggestion pipeline"""
    def __init__(self, message="Suggestion API encountered an error", code=500):
        super().__init__(message)
        self.code = code

class ExternalServiceError(Exception):
    """Raised when an external API or service fails"""
    def __init__(self, service_name, message=None):
        self.service_name = service_name
        self.message = message or f"External service '{service_name}' failed"
        super().__init__(self.message)

class ValidationError(Exception):
    """Raised when user input fails validation"""
    def __init__(self, field, message=None):
        self.field = field
        self.message = message or f"Validation failed for field '{field}'"
        super().__init__(self.message)

# -----------------------------------------------------------------------------
# Error Handlers Registration
# -----------------------------------------------------------------------------

def register_error_handlers(app):
    """
    Register Flask error handlers for centralized exception management.
    """

    @app.errorhandler(404)
    def handle_404(error):
        logger.warning(f"404 Not Found: {request.path}")
        return jsonify({"error": "Resource not found", "path": request.path}), 404

    @app.errorhandler(500)
    def handle_500(error):
        logger.error(f"500 Internal Server Error: {error}")
        return jsonify({"error": "Internal server error"}), 500

    @app.errorhandler(SuggestionAPIError)
    def handle_suggestion_api_error(error):
        logger.error(f"SuggestionAPIError: {error}")
        return jsonify({"error": str(error)}), getattr(error, "code", 500)

    @app.errorhandler(ExternalServiceError)
    def handle_external_service_error(error):
        logger.error(f"ExternalServiceError ({error.service_name}): {error.message}")
        return jsonify({"error": error.message}), 502

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        logger.info(f"ValidationError ({error.field}): {error.message}")
        return jsonify({"error": error.message}), 400

    # Catch-all fallback
    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        logger.exception(f"Unhandled Exception: {error}")
        return jsonify({"error": "Unhandled server error"}), 500

# -----------------------------------------------------------------------------
# Recovery and Monitoring Utilities
# -----------------------------------------------------------------------------

def log_error_to_external_service(error, service_name="Sentry"):
    """
    Logs the error to an external monitoring service.
    Currently a stub to simulate production logging integration.
    """
    logger.info(f"[{service_name}] Logged error: {error}")

def validate_request_fields(required_fields, request_data):
    """
    Validates the presence of required fields in a request payload.
    Raises ValidationError if missing.
    """
    missing = [f for f in required_fields if f not in request_data]
    if missing:
        raise ValidationError(field=", ".join(missing))

def attempt_recovery(error):
    """
    Simulated recovery strategy for known errors.
    Returns True if recovery succeeded, False otherwise.
    """
    logger.info(f"Attempting recovery for error: {error}")
    time.sleep(0.05)  # simulate processing
    return True

# -----------------------------------------------------------------------------
# Example utility function for logging & metrics
# -----------------------------------------------------------------------------

def error_metrics_payload(error):
    """
    Generates metrics payload for monitoring dashboards.
    """
    import uuid
    payload = {
        "error_id": str(uuid.uuid4()),
        "type": type(error).__name__,
        "message": str(error),
        "path": getattr(request, "path", "N/A"),
        "user_agent": request.headers.get("User-Agent", "N/A")
    }
    return payload
