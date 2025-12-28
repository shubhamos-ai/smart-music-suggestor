/**
 * search.js
 * ----------
 * Handles the search box input and auto-suggestion logic.
 * Connects to backend for fetching suggestions.
 *
 * Responsibilities:
 * - Debounce input to avoid excessive requests
 * - Manage search state
 * - Connect to backend API
 * - Trigger suggestion rendering
 * - Logging for analytics
 */

const SearchModule = (() => {
    // -----------------------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------------------
    const API_ENDPOINT = "/api/search";  // Backend endpoint for suggestions
    const DEBOUNCE_DELAY = 300;          // milliseconds

    // -----------------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------------
    let currentQuery = "";
    let timerId = null;
    let suggestions = [];
    let activeIndex = -1;

    // -----------------------------------------------------------------------------
    // Utility / Logging
    // -----------------------------------------------------------------------------
    const log = (message) => {
        console.debug(`[SearchModule] ${message}`);
    };

    const sanitizeInput = (input) => {
        return input.trim().toLowerCase();
    };

    // -----------------------------------------------------------------------------
    // Fetch suggestions
    // -----------------------------------------------------------------------------
    const fetchSuggestions = async (query) => {
        if (!query) return [];
        try {
            const response = await fetch(`${API_ENDPOINT}?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            log(`Fetched ${data.results.length} suggestions`);
            return data.results || [];
        } catch (err) {
            console.error("Error fetching suggestions:", err);
            return [];
        }
    };

    // -----------------------------------------------------------------------------
    // Render suggestions
    // -----------------------------------------------------------------------------
    const renderSuggestions = (list) => {
        const container = document.getElementById("suggestions-container");
        if (!container) return;

        container.innerHTML = "";

        list.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.dataset.index = index;
            div.innerHTML = `
                <img src="${item.thumbnail}" class="thumbnail" />
                <span class="title">${item.title}</span>
            `;
            div.addEventListener("click", () => selectSuggestion(index));
            container.appendChild(div);
        });
    };

    // -----------------------------------------------------------------------------
    // Select suggestion
    // -----------------------------------------------------------------------------
    const selectSuggestion = (index) => {
        if (index < 0 || index >= suggestions.length) return;
        const selected = suggestions[index];
        log(`Selected suggestion: ${selected.title}`);
        currentQuery = selected.title;
        document.getElementById("search-input").value = selected.title;

        // Trigger playback event
        PlayerModule.play(selected);
    };

    // -----------------------------------------------------------------------------
    // Handle input
    // -----------------------------------------------------------------------------
    const handleInput = (event) => {
        const value = sanitizeInput(event.target.value);
        currentQuery = value;

        if (timerId) clearTimeout(timerId);
        timerId = setTimeout(async () => {
            suggestions = await fetchSuggestions(currentQuery);
            renderSuggestions(suggestions);
        }, DEBOUNCE_DELAY);
    };

    // -----------------------------------------------------------------------------
    // Keyboard navigation
    // -----------------------------------------------------------------------------
    const handleKeyDown = (event) => {
        if (!suggestions.length) return;

        switch (event.key) {
            case "ArrowDown":
                activeIndex = (activeIndex + 1) % suggestions.length;
                highlightSuggestion(activeIndex);
                break;
            case "ArrowUp":
                activeIndex = (activeIndex - 1 + suggestions.length) % suggestions.length;
                highlightSuggestion(activeIndex);
                break;
            case "Enter":
                selectSuggestion(activeIndex);
                break;
        }
    };

    const highlightSuggestion = (index) => {
        const items = document.querySelectorAll(".suggestion-item");
        items.forEach((el, i) => {
            if (i === index) el.classList.add("active");
            else el.classList.remove("active");
        });
    };

    // -----------------------------------------------------------------------------
    // Initialization
    // -----------------------------------------------------------------------------
    const init = () => {
        const input = document.getElementById("search-input");
        if (!input) {
            console.error("Search input not found!");
            return;
        }
        input.addEventListener("input", handleInput);
        input.addEventListener("keydown", handleKeyDown);
        log("SearchModule initialized");
    };

    return {
        init,
        fetchSuggestions,
        renderSuggestions
    };
})();

// Auto-init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    SearchModule.init();
});
