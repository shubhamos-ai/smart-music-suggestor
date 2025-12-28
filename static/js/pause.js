/**
 * pause.js
 * --------
 * Handles pause and resume functionality for SHUBHAMOS Auto Suggestor.
 *
 * Responsibilities:
 * - Pause playback
 * - Resume playback
 * - Track pause duration and metrics
 * - Integrate with PlayerModule
 * - Provide queue-aware controls
 * - Logging and analytics
 */

const PauseModule = (() => {
    // -----------------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------------
    let isPaused = false;
    let pauseStart = null;
    let totalPauseDuration = 0;
    let metrics = {
        pauseCount: 0,
        totalPausedTime: 0
    };

    // -----------------------------------------------------------------------------
    // Logging
    // -----------------------------------------------------------------------------
    const log = (msg) => console.debug(`[PauseModule] ${msg}`);

    // -----------------------------------------------------------------------------
    // Pause playback
    // -----------------------------------------------------------------------------
    const pause = () => {
        if (!PlayerModule || !PlayerModule.getMetrics) {
            console.error("PlayerModule not initialized");
            return;
        }

        if (!isPaused) {
            PlayerModule.pause();
            pauseStart = new Date();
            isPaused = true;
            metrics.pauseCount++;
            log("Playback paused");
        } else {
            log("Playback already paused");
        }
    };

    // -----------------------------------------------------------------------------
    // Resume playback
    // -----------------------------------------------------------------------------
    const resume = () => {
        if (!isPaused) {
            log("Playback is not paused");
            return;
        }

        const now = new Date();
        const duration = (now - pauseStart) / 1000;
        totalPauseDuration += duration;
        metrics.totalPausedTime = totalPauseDuration;

        PlayerModule.resume();
        isPaused = false;
        log(`Playback resumed after ${duration.toFixed(2)} seconds`);
    };

    // -----------------------------------------------------------------------------
    // Toggle pause/resume
    // -----------------------------------------------------------------------------
    const toggle = () => {
        if (isPaused) resume();
        else pause();
    };

    // -----------------------------------------------------------------------------
    // Queue-aware pause (pause after current song ends)
    // -----------------------------------------------------------------------------
    const pauseAfterCurrent = () => {
        const queueMetrics = PlayerModule.getMetrics();
        log(`Queue length: ${queueMetrics.queueLength}`);
        if (queueMetrics.queueLength > 0) {
            const checkInterval = setInterval(() => {
                if (queueMetrics.queueLength - queueMetrics.playCount <= 1) {
                    pause();
                    clearInterval(checkInterval);
                    log("Paused after current song");
                }
            }, 500);
        } else {
            pause();
        }
    };

    // -----------------------------------------------------------------------------
    // Integration with UI buttons
    // -----------------------------------------------------------------------------
    const attachUI = () => {
        const pauseBtn = document.getElementById("pause-btn");
        if (pauseBtn) pauseBtn.addEventListener("click", toggle);

        const pauseAfterBtn = document.getElementById("pause-after-btn");
        if (pauseAfterBtn) pauseAfterBtn.addEventListener("click", pauseAfterCurrent);

        log("PauseModule UI listeners attached");
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
        log("PauseModule initialized");
    };

    return {
        init,
        pause,
        resume,
        toggle,
        pauseAfterCurrent,
        getMetrics
    };
})();

// Auto-init
document.addEventListener("DOMContentLoaded", () => {
    PauseModule.init();
});
