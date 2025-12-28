/**
 * shubhamos_ai.js
 * ----------------
 * Orchestrates search, suggestion, and playback modules.
 * Connects to backend WebSocket for real-time updates.
 *
 * Responsibilities:
 * - Initialize WebSocket connection
 * - Handle search input events
 * - Update SuggestionsModule dynamically
 * - Integrate with PlayerModule
 * - Provide retry and fallback logic
 * - Logging and metrics
 */

const ShubhamosAI = (() => {
    // -----------------------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------------------
    const WS_ENDPOINT = "ws://localhost:5000/socket.io/?EIO=4&transport=websocket";
    const MAX_RETRIES = 3;

    // -----------------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------------
    let socket = null;
    let retryCount = 0;
    let currentQuery = "";
    let metrics = {
        suggestionsFetched: 0,
        playbackTriggered: 0,
        wsReconnects: 0
    };

    // -----------------------------------------------------------------------------
    // Logging
    // -----------------------------------------------------------------------------
    const log = (msg) => console.debug(`[ShubhamosAI] ${msg}`);

    // -----------------------------------------------------------------------------
    // Initialize WebSocket
    // -----------------------------------------------------------------------------
    const initSocket = () => {
        try {
            socket = io.connect(WS_ENDPOINT);

            socket.on("connect", () => {
                log("WebSocket connected");
                retryCount = 0;
            });

            socket.on("disconnect", () => {
                log("WebSocket disconnected");
                attemptReconnect();
            });

            socket.on("suggestions", (data) => {
                metrics.suggestionsFetched++;
                SuggestionsModule.render(data.results);
                log(`Received ${data.results.length} suggestions from backend`);
            });

            socket.on("broadcast", (msg) => {
                log(`Broadcast message: ${msg.message}`);
            });
        } catch (err) {
            console.error("WebSocket initialization failed:", err);
            attemptReconnect();
        }
    };

    // -----------------------------------------------------------------------------
    // Retry / Reconnect
    // -----------------------------------------------------------------------------
    const attemptReconnect = () => {
        if (retryCount >= MAX_RETRIES) {
            log("Max WebSocket reconnect attempts reached");
            return;
        }
        retryCount++;
        metrics.wsReconnects++;
        log(`Attempting WebSocket reconnect #${retryCount}`);
        setTimeout(initSocket, 1000 * retryCount);
    };

    // -----------------------------------------------------------------------------
    // Handle Search Input
    // -----------------------------------------------------------------------------
    const handleSearchInput = (event) => {
        currentQuery = event.target.value.trim();
        if (!currentQuery) {
            SuggestionsModule.clear();
            return;
        }
        fetchSuggestions(currentQuery);
    };

    // -----------------------------------------------------------------------------
    // Fetch Suggestions
    // -----------------------------------------------------------------------------
    const fetchSuggestions = (query) => {
        if (socket && socket.connected) {
            socket.emit("suggestion_update", { query: query, room: "global" });
            log(`Sent suggestion_update for query: ${query}`);
        } else {
            log("Socket not connected, using fallback API");
            fallbackFetch(query);
        }
    };

    const fallbackFetch = async (query) => {
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            SuggestionsModule.render(data.results);
            metrics.suggestionsFetched++;
        } catch (err) {
            console.error("Fallback fetch failed:", err);
        }
    };

    // -----------------------------------------------------------------------------
    // Playback Integration
    // -----------------------------------------------------------------------------
    const playSuggestion = (item) => {
        PlayerModule.play(item);
        metrics.playbackTriggered++;
        log(`Playback triggered for: ${item.title}`);
    };

    // -----------------------------------------------------------------------------
    // Initialize
    // -----------------------------------------------------------------------------
    const init = () => {
        log("Initializing ShubhamosAI");
        initSocket();

        const input = document.getElementById("search-input");
        if (input) {
            input.addEventListener("input", handleSearchInput);
            log("Search input listener attached");
        } else {
            console.error("Search input not found");
        }
    };

    // -----------------------------------------------------------------------------
    // Expose public methods
    // -----------------------------------------------------------------------------
    return {
        init,
        fetchSuggestions,
        playSuggestion,
        metrics
    };
})();

// Auto-init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    ShubhamosAI.init();
});
