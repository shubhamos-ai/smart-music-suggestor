/**
 * suggestions.js
 * ---------------
 * Handles rendering, animations, and interaction of search suggestions.
 *
 * Responsibilities:
 * - Dynamically render suggestion list
 * - Animate suggestions on entry
 * - Highlight selection on hover/keyboard
 * - Integrate with PlayerModule for playback
 * - Logging for analytics
 */

const SuggestionsModule = (() => {
    // -----------------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------------
    let suggestionsContainer = null;
    let currentSuggestions = [];
    let highlightedIndex = -1;

    // -----------------------------------------------------------------------------
    // Logging utility
    // -----------------------------------------------------------------------------
    const log = (msg) => {
        console.debug(`[SuggestionsModule] ${msg}`);
    };

    // -----------------------------------------------------------------------------
    // Initialize container
    // -----------------------------------------------------------------------------
    const init = () => {
        suggestionsContainer = document.getElementById("suggestions-container");
        if (!suggestionsContainer) {
            console.error("Suggestions container not found!");
            return;
        }
        log("SuggestionsModule initialized");
    };

    // -----------------------------------------------------------------------------
    // Render suggestion list
    // -----------------------------------------------------------------------------
    const render = (suggestions) => {
        if (!suggestionsContainer) return;

        currentSuggestions = suggestions;
        suggestionsContainer.innerHTML = "";

        suggestions.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "suggestion-item";
            div.dataset.index = index;

            div.innerHTML = `
                <img src="${item.thumbnail}" class="thumbnail" />
                <div class="info">
                    <span class="title">${item.title}</span>
                </div>
            `;

            div.addEventListener("click", () => selectSuggestion(index));
            div.addEventListener("mouseenter", () => highlight(index));
            div.addEventListener("mouseleave", () => unhighlight(index));

            suggestionsContainer.appendChild(div);

            // Animate entry
            setTimeout(() => {
                div.style.opacity = 1;
                div.style.transform = "translateX(0)";
            }, index * 50);
        });
    };

    // -----------------------------------------------------------------------------
    // Highlight / unhighlight
    // -----------------------------------------------------------------------------
    const highlight = (index) => {
        const items = suggestionsContainer.querySelectorAll(".suggestion-item");
        items.forEach((el, i) => {
            if (i === index) el.classList.add("active");
            else el.classList.remove("active");
        });
        highlightedIndex = index;
    };

    const unhighlight = (index) => {
        const items = suggestionsContainer.querySelectorAll(".suggestion-item");
        if (items[index]) items[index].classList.remove("active");
        highlightedIndex = -1;
    };

    // -----------------------------------------------------------------------------
    // Select a suggestion
    // -----------------------------------------------------------------------------
    const selectSuggestion = (index) => {
        if (index < 0 || index >= currentSuggestions.length) return;
        const item = currentSuggestions[index];
        log(`Selected suggestion: ${item.title}`);

        // Update search input
        const searchInput = document.getElementById("search-input");
        if (searchInput) searchInput.value = item.title;

        // Trigger playback
        PlayerModule.play(item);
    };

    // -----------------------------------------------------------------------------
    // Handle keyboard navigation
    // -----------------------------------------------------------------------------
    const handleKeyboard = (key) => {
        if (!currentSuggestions.length) return;

        switch (key) {
            case "ArrowDown":
                highlightedIndex = (highlightedIndex + 1) % currentSuggestions.length;
                highlight(highlightedIndex);
                break;
            case "ArrowUp":
                highlightedIndex = (highlightedIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
                highlight(highlightedIndex);
                break;
            case "Enter":
                selectSuggestion(highlightedIndex);
                break;
        }
    };

    // -----------------------------------------------------------------------------
    // Utility for clearing suggestions
    // -----------------------------------------------------------------------------
    const clear = () => {
        if (suggestionsContainer) suggestionsContainer.innerHTML = "";
        currentSuggestions = [];
        highlightedIndex = -1;
    };

    return {
        init,
        render,
        clear,
        handleKeyboard,
        highlight,
        selectSuggestion
    };
})();

// Auto-init
document.addEventListener("DOMContentLoaded", () => {
    SuggestionsModule.init();
});
