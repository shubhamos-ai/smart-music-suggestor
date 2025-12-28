/**
 * playback_controller.js
 * ---------------------
 * Central hub for SHUBHAMOS Auto Suggestor playback controls.
 *
 * Responsibilities:
 * - Coordinate PlayerModule, PauseModule, SkipModule, ShuffleModule, RepeatModule
 * - Manage playback queue
 * - Aggregate metrics
 * - Attach UI events for all controls
 * - Logging and analytics
 */

const PlaybackController = (() => {
    // -----------------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------------
    let metrics = {
        totalPlay: 0,
        totalPause: 0,
        totalSkips: 0,
        totalShuffle: 0,
        totalRepeats: 0
    };

    // -----------------------------------------------------------------------------
    // Logging
    // -----------------------------------------------------------------------------
    const log = (msg) => console.debug(`[PlaybackController] ${msg}`);

    // -----------------------------------------------------------------------------
    // Attach UI controls
    // -----------------------------------------------------------------------------
    const attachUI = () => {
        const playBtn = document.getElementById("play-btn");
        const pauseBtn = document.getElementById("pause-btn");
        const nextBtn = document.getElementById("skip-next-btn");
        const prevBtn = document.getElementById("skip-prev-btn");
        const shuffleBtn = document.getElementById("shuffle-btn");
        const repeatBtn = document.getElementById("repeat-btn");

        if (playBtn) playBtn.addEventListener("click", () => {
            PlayerModule.resume();
            metrics.totalPlay++;
        });
        if (pauseBtn) pauseBtn.addEventListener("click", () => {
            PauseModule.toggle();
            metrics.totalPause++;
        });
        if (nextBtn) nextBtn.addEventListener("click", () => {
            SkipModule.skipNext();
            metrics.totalSkips++;
        });
        if (prevBtn) prevBtn.addEventListener("click", () => {
            SkipModule.skipPrevious();
            metrics.totalSkips++;
        });
        if (shuffleBtn) shuffleBtn.addEventListener("click", () => {
            ShuffleModule.toggleShuffle();
            metrics.totalShuffle++;
        });
        if (repeatBtn) repeatBtn.addEventListener("click", () => {
            RepeatModule.toggleRepeat();
            metrics.totalRepeats++;
        });

        log("PlaybackController UI listeners attached");
    };

    // -----------------------------------------------------------------------------
    // Aggregate metrics from modules
    // -----------------------------------------------------------------------------
    const aggregateMetrics = () => {
        const playerMetrics = PlayerModule.getMetrics();
        const pauseMetrics = PauseModule.getMetrics();
        const skipMetrics = SkipModule.getMetrics();
        const shuffleMetrics = ShuffleModule.getMetrics();
        const repeatMetrics = RepeatModule.getMetrics();

        metrics.totalPlay = playerMetrics.playCount;
        metrics.totalPause = pauseMetrics.pauseCount;
        metrics.totalSkips = skipMetrics.skipsNext + skipMetrics.skipsPrevious;
        metrics.totalShuffle = shuffleMetrics.shufflesPerformed;
        metrics.totalRepeats = repeatMetrics.repeatsPerformed;

        return metrics;
    };

    // -----------------------------------------------------------------------------
    // Display metrics in UI
    // -----------------------------------------------------------------------------
    const displayMetrics = () => {
        const metricsContainer = document.getElementById("metrics-container");
        if (!metricsContainer) return;

        const m = aggregateMetrics();
        metricsContainer.innerHTML = `
            <p>Total Plays: ${m.totalPlay}</p>
            <p>Total Pauses: ${m.totalPause}</p>
            <p>Total Skips: ${m.totalSkips}</p>
            <p>Total Shuffles: ${m.totalShuffle}</p>
            <p>Total Repeats: ${m.totalRepeats}</p>
        `;
    };

    // -----------------------------------------------------------------------------
    // Auto-update metrics periodically
    // -----------------------------------------------------------------------------
    const autoUpdateMetrics = () => {
        setInterval(displayMetrics, 2000);
    };

    // -----------------------------------------------------------------------------
    // Playback shortcuts
    // -----------------------------------------------------------------------------
    const attachShortcuts = () => {
        document.addEventListener("keydown", (e) => {
            switch (e.code) {
                case "Space":
                    PauseModule.toggle();
                    break;
                case "ArrowRight":
                    SkipModule.skipNext();
                    break;
                case "ArrowLeft":
                    SkipModule.skipPrevious();
                    break;
                case "KeyS":
                    ShuffleModule.toggleShuffle();
                    break;
                case "KeyR":
                    RepeatModule.toggleRepeat();
                    break;
            }
        });
        log("PlaybackController keyboard shortcuts attached");
    };

    // -----------------------------------------------------------------------------
    // Initialization
    // -----------------------------------------------------------------------------
    const init = () => {
        attachUI();
        attachShortcuts();
        autoUpdateMetrics();
        log("PlaybackController initialized");
    };

    return {
        init,
        aggregateMetrics,
        displayMetrics
    };
})();

// Auto-init
document.addEventListener("DOMContentLoaded", () => {
    PlaybackController.init();
});
