/**
 * skip.js
 * -------
 * Handles skipping tracks (next/previous) in SHUBHAMOS Auto Suggestor.
 *
 * Responsibilities:
 * - Skip to next or previous song
 * - Integrate with PlayerModule
 * - Maintain queue state
 * - Update metrics for analytics
 * - Handle shuffle and repeat logic
 */

const SkipModule = (() => {
    // -----------------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------------
    let metrics = {
        skipsNext: 0,
        skipsPrevious: 0
    };

    // -----------------------------------------------------------------------------
    // Logging
    // -----------------------------------------------------------------------------
    const log = (msg) => console.debug(`[SkipModule] ${msg}`);

    // -----------------------------------------------------------------------------
    // Skip to next track
    // -----------------------------------------------------------------------------
    const skipNext = () => {
        if (!PlayerModule) {
            console.error("PlayerModule not initialized");
            return;
        }

        PlayerModule.playNext();
        metrics.skipsNext++;
        log("Skipped to next track");

        updateQueueUI();
    };

    // -----------------------------------------------------------------------------
    // Skip to previous track
    // -----------------------------------------------------------------------------
    const skipPrevious = () => {
        if (!PlayerModule) {
            console.error("PlayerModule not initialized");
            return;
        }

        PlayerModule.playPrevious();
        metrics.skipsPrevious++;
        log("Skipped to previous track");

        updateQueueUI();
    };

    // -----------------------------------------------------------------------------
    // Queue display update
    // -----------------------------------------------------------------------------
    const updateQueueUI = () => {
        const queueContainer = document.getElementById("queue-container");
        if (!queueContainer) return;

        const queueMetrics = PlayerModule.getMetrics();
        queueContainer.innerHTML = `<p>Queue length: ${queueMetrics.queueLength}</p>
                                    <p>Current play count: ${queueMetrics.playCount}</p>`;
    };

    // -----------------------------------------------------------------------------
    // Attach UI buttons
    // -----------------------------------------------------------------------------
    const attachUI = () => {
        const nextBtn = document.getElementById("skip-next-btn");
        const prevBtn = document.getElementById("skip-prev-btn");

        if (nextBtn) nextBtn.addEventListener("click", skipNext);
        if (prevBtn) prevBtn.addEventListener("click", skipPrevious);

        log("SkipModule UI listeners attached");
    };

    // -----------------------------------------------------------------------------
    // Shuffle-aware skip
    // -----------------------------------------------------------------------------
    const shuffleAwareSkip = () => {
        const queueMetrics = PlayerModule.getMetrics();
        if (queueMetrics.queueLength > 1) {
            const shuffle = Math.random() < 0.5;
            if (shuffle) {
                PlayerModule.shuffleQueue();
                log("Queue shuffled before skip");
            }
        }
        skipNext();
    };

    // -----------------------------------------------------------------------------
    // Metrics retrieval
    // -----------------------------------------------------------------------------
    const getMetrics = () => metrics;

    // -----------------------------------------------------------------------------
    // Initialization
    // -----------------------------------------------------------------------------
    const init = () => {
        attachUI();
        log("SkipModule initialized");
    };

    return {
        init,
        skipNext,
        skipPrevious,
        shuffleAwareSkip,
        getMetrics
    };
})();

// Auto-init
document.addEventListener("DOMContentLoaded", () => {
    SkipModule.init();
});
