"""
Fallback Module
---------------
Handles graceful degradation and resilient responses when primary services fail.

Responsibilities:
- Generate structured fallback responses
- Log failures for observability
- Integrate with monitoring and alerting
- Provide recovery hooks
- Support multiple categories of fallback responses
"""

import logging
import random
import time
from typing import List, Dict

# -----------------------------------------------------------------------------
# Logger Configuration
# -----------------------------------------------------------------------------
logger = logging.getLogger("FallbackHandler")
logger.setLevel(logging.INFO)

_stream_handler = logging.StreamHandler()
_formatter = logging.Formatter("[%(asctime)s] %(levelname)s :: %(message)s")
_stream_handler.setFormatter(_formatter)
logger.addHandler(_stream_handler)

# -----------------------------------------------------------------------------
# Predefined fallback datasets
# -----------------------------------------------------------------------------
FALLBACK_SONGS = [
    {"title": "Shape of You", "video_id": "JGwWNGJdvx8", "thumbnail": "https://i.ytimg.com/vi/JGwWNGJdvx8/default.jpg"},
    {"title": "Blinding Lights", "video_id": "4NRXx6U8ABQ", "thumbnail": "https://i.ytimg.com/vi/4NRXx6U8ABQ/default.jpg"},
    {"title": "Levitating", "video_id": "TUVcZfQe-Kw", "thumbnail": "https://i.ytimg.com/vi/TUVcZfQe-Kw/default.jpg"},
    {"title": "Dance Monkey", "video_id": "q0hyYWKXF0Q", "thumbnail": "https://i.ytimg.com/vi/q0hyYWKXF0Q/default.jpg"},
    {"title": "Someone You Loved", "video_id": "zABLecsR5UE", "thumbnail": "https://i.ytimg.com/vi/zABLecsR5UE/default.jpg"}
]

FALLBACK_PLAYLISTS = [
    {"name": "Top Hits", "playlist_id": "PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI"},
    {"name": "Pop Essentials", "playlist_id": "PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj"}
]

# -----------------------------------------------------------------------------
# Fallback Class
# -----------------------------------------------------------------------------
class FallbackHandler:
    """
    Provides structured fallback responses and recovery actions.
    """

    def __init__(self):
        self.retry_count = 0
        self.max_retries = 3
        logger.info("FallbackHandler initialized")

    # -------------------------------------------------------------------------
    # Fallback Responses
    # -------------------------------------------------------------------------
    def get_songs(self, limit: int = 5) -> List[Dict]:
        """
        Return a list of fallback songs
        """
        logger.debug(f"Providing {limit} fallback songs")
        return random.sample(FALLBACK_SONGS, k=min(limit, len(FALLBACK_SONGS)))

    def get_playlists(self) -> List[Dict]:
        """
        Return fallback playlists
        """
        logger.debug("Returning fallback playlists")
        return FALLBACK_PLAYLISTS

    # -------------------------------------------------------------------------
    # Recovery / Retry
    # -------------------------------------------------------------------------
    def attempt_recovery(self, func, *args, **kwargs):
        """
        Attempt to execute a function with retries on failure
        """
        while self.retry_count < self.max_retries:
            try:
                result = func(*args, **kwargs)
                return result
            except Exception as e:
                self.retry_count += 1
                logger.warning(f"Recovery attempt {self.retry_count} failed: {e}")
                time.sleep(0.1)
        logger.error(f"All {self.max_retries} recovery attempts failed")
        return self.get_songs()  # fallback to songs

    # -------------------------------------------------------------------------
    # Normalization Utilities
    # -------------------------------------------------------------------------
    def normalize_song(self, song: Dict) -> Dict:
        """
        Ensure song dictionary has all required fields
        """
        normalized = {
            "title": song.get("title", "Unknown Song"),
            "video_id": song.get("video_id", ""),
            "thumbnail": song.get("thumbnail", "")
        }
        logger.debug(f"Normalized song: {normalized}")
        return normalized

    def normalize_playlist(self, playlist: Dict) -> Dict:
        """
        Ensure playlist dictionary has all required fields
        """
        normalized = {
            "name": playlist.get("name", "Unknown Playlist"),
            "playlist_id": playlist.get("playlist_id", "")
        }
        logger.debug(f"Normalized playlist: {normalized}")
        return normalized

    # -------------------------------------------------------------------------
    # Metrics / Observability
    # -------------------------------------------------------------------------
    def get_metrics(self) -> Dict:
        """
        Returns internal metrics for monitoring
        """
        return {
            "fallback_invocations": self.retry_count,
            "available_songs": len(FALLBACK_SONGS),
            "available_playlists": len(FALLBACK_PLAYLISTS)
        }

    # -------------------------------------------------------------------------
    # Utility / Helpers
    # -------------------------------------------------------------------------
    def select_random_song(self) -> Dict:
        """
        Select a random song from fallback
        """
        song = random.choice(FALLBACK_SONGS)
        logger.debug(f"Random fallback song selected: {song['title']}")
        return self.normalize_song(song)

    def select_random_playlist(self) -> Dict:
        """
        Select a random playlist
        """
        playlist = random.choice(FALLBACK_PLAYLISTS)
        logger.debug(f"Random fallback playlist selected: {playlist['name']}")
        return self.normalize_playlist(playlist)
