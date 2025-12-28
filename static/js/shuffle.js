/**
 * shuffle.js
 * ----------
 * Handles shuffle functionality in SHUBHAMOS Auto Suggestor.
 *
 * Responsibilities:
 * - Toggle shuffle mode
 * - Shuffle the playback queue
 * - Update queue and UI
 * - Integrate with PlayerModule and SkipModule
 * - Track shuffle metrics
 * - Logging for analytics
 */

const ShuffleModule = (() => {
    // -----------------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------------
    let isShuffleEnabled = false;
    let metrics = {
        shuffleToggles: 0,
        shufflesPerformed: 0
    };

    // -----------------------------------------------------------------------------
    // Logging
    // -----------------------------------------------------------------------------
    const log = (msg) => console.debug(`[ShuffleModule] ${msg}`);

    // -----------------------------------------------------------------------------
    // Toggle shuffle mode
    // -----------------------------------------------------------------------------
    const toggleShuffle = () => {
        isShuffleEnabled = !isShuffleEnabled;
        metrics.shuffleToggles++;
        log(`Shuffle mode ${isShuffleEnabled ? "enabled" : "disabled"}`);

        if (isShuffleEnabled) shuffleQueue();
    };

    // -----------------------------------------------------------------------------
    // Shuffle the queue
    // -----------------------------------------------------------------------------
    const shuffleQueue = () => {
        if (!PlayerModule) {
            console.error("PlayerModule not initialized");
            return;
        }

        const queueMetrics = PlayerModule.getMetrics();
        const queueLength = queueMetrics.queueLength;

        if (queueLength < 2) {
            log("Not enough songs to shuffle");
            return;
        }

        const queueCopy = [...PlayerModule.currentQueue || []];
        for (let i = queueCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [queueCopy[i], queueCopy[j]] = [queueCopy[j], queueCopy[i]];
        }

        PlayerModule.clearQueue();
        queueCopy.forEach((item) => PlayerModule.addToQueue(item));

        metrics.shufflesPerformed++;
        log(`Queue shuffled: ${queueCopy.map(i => i.title).join(", ")}`);
        updateQueueUI();
    };

    // -----------------------------------------------------------------------------
    // Update UI
    // -----------------------------------------------------------------------------
    const updateQueueUI = () => {
        const queueContainer = document.getElementById("queue-container");
        if (!queueContainer) return;

        const queueMetrics = PlayerModule.getMetrics();
        queueContainer.innerHTML = `<p>Queue length: ${queueMetrics.queueLength}</p>
                                    <p>Shuffles performed: ${metrics.shufflesPerformed}</p>`;
    };

    // -----------------------------------------------------------------------------
    // Attach UI buttons
    // -----------------------------------------------------------------------------
    const attachUI = () => {
        const shuffleBtn = document.getElementById("shuffle-btn");
        if (shuffleBtn) shuffleBtn.addEventListener("click", toggleShuffle);
        log("ShuffleModule UI listeners attached");
    };

    // -----------------------------------------------------------------------------
    // Get metrics
    // -----------------------------------------------------------------------------
    const getMetrics = () => metrics;

    // -----------------------------------------------------------------------------
    // Initialization
    // -----------------------------------------------------------------------------
    const init = () => {
        attachUI();
        log("ShuffleModule initialized");
    };

    return {
        init,
        toggleShuffle,
        shuffleQueue,
        getMetrics
    };
})();

// Auto-init
document.addEventListener("DOMContentLoaded", () => {
    ShuffleModule.init();
});
