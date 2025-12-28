"""
YouTubeCommunicator
-------------------
Responsible for communicating with external YouTube Data API.

Design goals:
- Isolate third-party dependencies
- Normalize external responses
- Centralize request logic
- Prepare for future provider swapping (Spotify, SoundCloud, etc.)
"""

import time
import logging
from typing import List, Dict, Any
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# -----------------------------------------------------------------------------
# Logging Configuration
# -----------------------------------------------------------------------------

logger = logging.getLogger("YouTubeCommunicator")
logger.setLevel(logging.INFO)

_stream_handler = logging.StreamHandler()
_formatter = logging.Formatter(
    "[%(asctime)s] %(levelname)s %(name)s :: %(message)s"
)
_stream_handler.setFormatter(_formatter)
logger.addHandler(_stream_handler)

# -----------------------------------------------------------------------------
# Communicator Class
# -----------------------------------------------------------------------------

class YouTubeCommunicator:
    """
    Handles all YouTube Data API interactions.

    This class abstracts:
    - API client initialization
    - Query execution
    - Response parsing
    - Error handling
    """

    DEFAULT_MAX_RESULTS = 7
    API_SERVICE_NAME = "youtube"
    API_VERSION = "v3"

    def __init__(self, api_key: str = "YOUR_API_KEY"):
        """
        Initialize the YouTube API client.

        Args:
            api_key (str): YouTube Data API key
        """
        self.api_key = api_key
        self.client = self._initialize_client()
        self.request_count = 0
        logger.info("YouTubeCommunicator initialized")

    # -------------------------------------------------------------------------
    # Client Setup
    # -------------------------------------------------------------------------

    def _initialize_client(self):
        """
        Create and return a YouTube API client instance.
        """
        logger.debug("Initializing YouTube API client")
        return build(
            self.API_SERVICE_NAME,
            self.API_VERSION,
            developerKey=self.api_key
        )

    # -------------------------------------------------------------------------
    # Public API
    # -------------------------------------------------------------------------

    def search(self, query: str, max_results: int = None) -> List[Dict[str, Any]]:
        """
        Perform a search request against YouTube.

        Args:
            query (str): Search query
            max_results (int): Maximum results to return

        Returns:
            List[Dict]: Normalized video metadata
        """
        if not query:
            logger.warning("Empty search query received")
            return []

        max_results = max_results or self.DEFAULT_MAX_RESULTS
        self._increment_request_counter()

        logger.info(f"Executing search query: {query}")

        try:
            raw_response = self._execute_search(query, max_results)
            return self._parse_response(raw_response)

        except HttpError as http_err:
            logger.error(f"YouTube API HTTP error: {http_err}")
            return []

        except Exception as exc:
            logger.exception(f"Unexpected error during search: {exc}")
            return []

    # -------------------------------------------------------------------------
    # Internal Methods
    # -------------------------------------------------------------------------

    def _execute_search(self, query: str, max_results: int):
        """
        Execute the raw YouTube API search call.
        """
        request = self.client.search().list(
            q=query,
            part="snippet",
            type="video",
            maxResults=max_results
        )

        start_time = time.time()
        response = request.execute()
        elapsed = time.time() - start_time

        logger.debug(f"API request completed in {elapsed:.3f}s")
        return response

    def _parse_response(self, response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Normalize YouTube API response into internal format.
        """
        items = response.get("items", [])
        normalized_results = []

        for item in items:
            snippet = item.get("snippet", {})
            video_id = item.get("id", {}).get("videoId")

            if not video_id:
                continue

            normalized_results.append({
                "title": snippet.get("title"),
                "description": snippet.get("description"),
                "video_id": video_id,
                "thumbnail": snippet.get("thumbnails", {})
                                  .get("default", {})
                                  .get("url")
            })

        logger.info(f"Parsed {len(normalized_results)} search results")
        return normalized_results

    # -------------------------------------------------------------------------
    # Metrics / Observability
    # -------------------------------------------------------------------------

    def _increment_request_counter(self):
        """
        Track number of API requests made.
        """
        self.request_count += 1
        logger.debug(f"Total API requests: {self.request_count}")

    def get_metrics(self) -> Dict[str, Any]:
        """
        Expose internal metrics.
        """
        return {
            "provider": "youtube",
            "requests_made": self.request_count
        }

    # -------------------------------------------------------------------------
    # Extensibility Hooks
    # -------------------------------------------------------------------------

    def health_check(self) -> bool:
        """
        Perform a lightweight check to ensure API availability.
        """
        try:
            self.search("test", max_results=1)
            return True
        except Exception:
            return False
