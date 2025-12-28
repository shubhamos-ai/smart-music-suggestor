/**
 * loader.js
 * ----------
 * Handles loading states, progress bars, and async fetch animations
 * in SHUBHAMOS Auto Suggestor.
 *
 * Responsibilities:
 * - Display spinner during async operations
 * - Show progress bars for loading songs or suggestions
 * - Integrate with SearchModule, SuggestionsModule, PlayerModule
 * - Logging & analytics
 * - Modular and reusable functions
 */

const LoaderModule = (() => {
    // -----------------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------------
    let activeLoaders = {};
    let metrics = {
        totalLoads: 0,
        totalErrors: 0
    };

    // -----------------------------------------------------------------------------
    // Logging
    // -----------------------------------------------------------------------------
    const log = (msg) => console.debug(`[LoaderModule] ${msg}`);

    // -----------------------------------------------------------------------------
    // Show a loader
    // -----------------------------------------------------------------------------
    const showLoader = (id, message = "Loading...") => {
        let container = document.getElementById(id);
        if (!container) {
            container = document.createElement("div");
            container.id = id;
            container.className = "loader-container";
            document.body.appendChild(container);
        }
        container.innerHTML = `<div class="spinner"></div><p>${message}</p>`;
        activeLoaders[id] = true;
        metrics.totalLoads++;
        log(`Loader shown: ${id}`);
    };

    // -----------------------------------------------------------------------------
    // Hide a loader
    // -----------------------------------------------------------------------------
    const hideLoader = (id) => {
        const container = document.getElementById(id);
        if (container) container.remove();
        delete activeLoaders[id];
        log(`Loader hidden: ${id}`);
    };

    // -----------------------------------------------------------------------------
    // Show progress bar
    // -----------------------------------------------------------------------------
    const showProgress = (id, message = "Processing...", duration = 3000) => {
        let container = document.getElementById(id);
        if (!container) {
            container = document.createElement("div");
            container.id = id;
            container.className = "progress-container";
            document.body.appendChild(container);
        }
        container.innerHTML = `<p>${message}</p><div class="progress-bar"><div class="progress-fill"></div></div>`;
        const fill = container.querySelector(".progress-fill");
        let progress = 0;
        const interval = setInterval(() => {
            progress += 1;
            fill.style.width = `${progress}%`;
            if (progress >= 100) clearInterval(interval);
        }, duration / 100);
        metrics.totalLoads++;
        log(`Progress bar started: ${id}`);
    };

    // -----------------------------------------------------------------------------
    // Attach loader to async fetch
    // -----------------------------------------------------------------------------
    const wrapAsync = async (id, asyncFunc) => {
        try {
            showLoader(id);
            const result = await asyncFunc();
            hideLoader(id);
            return result;
        } catch (err) {
            hideLoader(id);
            metrics.totalErrors++;
            log(`Error in loader wrap: ${err}`);
        }
    };

    // -----------------------------------------------------------------------------
    // Queue loader simulation
    // -----------------------------------------------------------------------------
    const simulateQueueLoading = () => {
        showProgress("queue-loader", "Loading your queue...", 4000);
    };

    // -----------------------------------------------------------------------------
    // Song fetch simulation
    // -----------------------------------------------------------------------------
    const simulateSongFetch = (songName) => {
        return wrapAsync("song-fetch-loader", async () => {
            log(`Fetching song: ${songName}`);
            return new Promise((resolve) => setTimeout(() => resolve(songName), 2500));
        });
    };

    // -----------------------------------------------------------------------------
    // Suggestions fetch simulation
    // -----------------------------------------------------------------------------
    const simulateSuggestionsFetch = (query) => {
        return wrapAsync("suggestions-loader", async () => {
            log(`Fetching suggestions for: ${query}`);
            return new Promise((resolve) => setTimeout(() => resolve([query + " 1", query + " 2", query + " 3"]), 3000));
        });
    };

    // -----------------------------------------------------------------------------
    // Metrics retrieval
    // -----------------------------------------------------------------------------
    const getMetrics = () => metrics;

    // -----------------------------------------------------------------------------
    // Initialization
    // -----------------------------------------------------------------------------
    const init = () => {
        const style = document.createElement("style");
        style.innerHTML = `
            .loader-container, .progress-container { position: fixed; top: 20px; right: 20px; background: rgba(0,0,0,0.8); color: #fff; padding: 10px; border-radius: 8px; z-index: 9999; }
            .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #9c27b0; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin-bottom: 5px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            .progress-bar { width: 100%; background: #444; border-radius: 4px; overflow: hidden; }
            .progress-fill { width: 0%; height: 8px; background: linear-gradient(90deg, #9c27b0, #f44336); transition: width 0.1s linear; }
        `;
        document.head.appendChild(style);
        log("LoaderModule initialized");
    };

    return {
        init,
        showLoader,
        hideLoader,
        showProgress,
        wrapAsync,
        simulateQueueLoading,
        simulateSongFetch,
        simulateSuggestionsFetch,
        getMetrics
    };
})();

// Auto-init
document.addEventListener("DOMContentLoaded", () => {
    LoaderModule.init();
});
