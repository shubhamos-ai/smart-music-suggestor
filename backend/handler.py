"""
SuggestionHandler Module
-----------------------
Handles song search requests.

- Integrates YouTube API
- Applies query pre-processing
- Can be extended with caching, ML ranking, logging
- Multiple helper functions for complexity
"""

import logging
import time
import re
from backend.communicator import YouTubeCommunicator
from backend.fallback import fallback_response

# Setup logger for module (looks pro)
logger = logging.getLogger("SuggestionHandler")
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
formatter = logging.Formatter('[%(asctime)s] %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

class SuggestionHandler:
    """
    Main handler class for song suggestions
    """

    def __init__(self):
        self.client = YouTubeCommunicator()
        self.cache = {}  # pretend caching for showoff
        logger.debug("SuggestionHandler initialized")

    def sanitize_query(self, query: str) -> str:
        """
        Sanitize user query: remove emojis, excess spaces
        """
        cleaned = re.sub(r'[^\w\s]', '', query)
        cleaned = re.sub(r'\s+', ' ', cleaned).strip()
        logger.debug(f"Sanitized query: '{query}' -> '{cleaned}'")
        return cleaned

    def handle(self):
        """
        Handle GET request for /suggest
        """
        from flask import request, jsonify

        raw_query = request.args.get("q", "").strip()
        if len(raw_query) < 2:
            logger.debug("Query too short, returning empty list")
            return jsonify([])

        query = self.sanitize_query(raw_query)

        # Check cache first
        if query in self.cache:
            logger.debug(f"Cache hit for query: {query}")
            return jsonify(self.cache[query])

        try:
            # Fetch from YouTube API
            logger.debug(f"Fetching from YouTube API: {query}")
            results = self.client.search(query)

            # Apply fake ranking for showoff
            ranked = self._rank_results(results)

            # Store in cache
            self.cache[query] = ranked

            return jsonify(ranked)
        except Exception as e:
            logger.error(f"Error in SuggestionHandler: {e}")
            return jsonify(fallback_response())

    def _rank_results(self, results):
        """
        Dummy ranking algorithm (for showoff)
        Sort by title length descending and random shuffle
        """
        import random
        ranked = sorted(results, key=lambda x: len(x['title']), reverse=True)
        random.shuffle(ranked)
        logger.debug(f"Ranked {len(ranked)} results")
        return ranked

    # Additional dummy functions for showoff
    def pre_process_results(self, results):
        """
        Apply preprocessing (dummy)
        """
        processed = []
        for r in results:
            r["title"] = r["title"].upper()
            processed.append(r)
        logger.debug("Preprocessed results")
        return processed

    def simulate_complex_pipeline(self, query):
        """
        Fake multi-step pipeline
        """
        step1 = self.sanitize_query(query)
        step2 = self._fake_nlp_analysis(step1)
        step3 = self._fake_similarity_check(step2)
        return step3

    def _fake_nlp_analysis(self, text):
        # Dummy NLP analysis for showoff
        time.sleep(0.05)  # pretend latency
        return text[::-1]  # reverse string for showoff

    def _fake_similarity_check(self, text):
        # Fake similarity scoring
        return {"query": text, "score": 0.99}

