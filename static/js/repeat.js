/**
 * repeat.js
 * ---------
 * Handles repeat functionality in SHUBHAMOS Auto Suggestor.
 *
 * Responsibilities:
 * - Toggle repeat mode (off, single, all)
 * - Integrate with PlayerModule and queue
 * - Update UI accordingly
 * - Track metrics for analytics
 * - Logging for debugging
 */

const RepeatModule = (() => {
    // -----------------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------------
    const REPEAT_MODES = ["off", "single", "all"];
    let currentModeIndex = 0; // 0 = off, 1 = single, 2 = all
    let metrics = {
        toggles: 0,
        repeatsPerformed: 0
    };

    // -----------------------------------------------------------------------------
    // Logging
    // -----------------------------------------------------------------------------
    const log = (msg) => console.debug(`[RepeatModule] ${msg}`);

    // -----------------------------------------------------------------------------
    // Get current repeat mode
    // -----------------------------------------------------------------------------
    const getCurrentMode = () => REPEAT_MODES[currentModeIndex];

    // -----------------------------------------------------------------------------
    // Toggle repeat mode
    // -----------------------------------------------------------------------------
    const toggleRepeat = () => {
        currentModeIndex = (currentModeIndex + 1) % REPEAT_MODES.length;
        metrics.toggles++;
        log(`Repeat mode set to: ${getCurrentMode()}`);
        updateUI();
    };

    // -----------------------------------------------------------------------------
    // Handle song end behavior based on repeat mode
    // -----------------------------------------------------------------------------
    const handleSongEnd = () => {
        const mode = getCurrentMode();
        if (!PlayerModule) return;

        if (mode === "single") {
            PlayerModule.play(PlayerModule.currentQueue[PlayerModule.currentIndex]);
            metrics.repeatsPerformed++;
            log("Repeated current song");
        } else if (mode === "all") {
            PlayerModule.playNext();
            if (PlayerModule.currentIndex >= PlayerModule.currentQueue.length) {
                PlayerModule.currentIndex = 0;
                PlayerModule.play(PlayerModule.currentQueue[0]);
                log("Repeated entire queue");
            }
            metrics.repeatsPerformed++;
        } else {
            log("Repeat mode off, no action taken");
        }
    };

    // -----------------------------------------------------------------------------
    // Attach UI
    // -----------------------------------------------------------------------------
    const attachUI = () => {
        const repeatBtn = document.getElementById("repeat-btn");
        if (repeatBtn) repeatBtn.addEventListener("click", toggleRepeat);
        log("RepeatModule UI listeners attached");
    };

    // -----------------------------------------------------------------------------
    // Update UI
    // -----------------------------------------------------------------------------
    const updateUI = () => {
        const repeatBtn = document.getElementById("repeat-btn");
        if (repeatBtn) repeatBtn.innerText = `Repeat: ${getCurrentMode().toUpperCase()}`;
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
        log("RepeatModule initialized");
        if (PlayerModule && PlayerModule.audioElement) {
            PlayerModule.audioElement.addEventListener("ended", handleSongEnd);
        }
    };

    return {
        init,
        toggleRepeat,
        handleSongEnd,
        getMetrics
    };
})();

// Auto-init
document.addEventListener("DOMContentLoaded", () => {
    RepeatModule.init();
});
