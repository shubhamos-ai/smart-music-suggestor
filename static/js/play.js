/**
 * play.js
 * -------
 * Handles the playback functionality for SHUBHAMOS Auto Suggestor.
 *
 * Responsibilities:
 * - Manage playback queue
 * - Play selected song
 * - Integrate with ShubhamosAI and SuggestionsModule
 * - Track playback metrics
 * - Provide helper methods for UI updates
 */

const PlayerModule = (() => {
    // -----------------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------------
    let audioElement = null;
    let currentQueue = [];
    let currentIndex = -1;
    let isPlaying = false;
    let metrics = {
        playCount: 0,
        queueLength: 0,
        skips: 0
    };

    // -----------------------------------------------------------------------------
    // Logging utility
    // -----------------------------------------------------------------------------
    const log = (msg) => console.debug(`[PlayerModule] ${msg}`);

    // -----------------------------------------------------------------------------
    // Initialize audio element
    // -----------------------------------------------------------------------------
    const init = () => {
        audioElement = document.createElement("audio");
        audioElement.id = "player-audio";
        audioElement.autoplay = false;
        audioElement.controls = false;
        document.body.appendChild(audioElement);

        audioElement.addEventListener("ended", () => {
            log("Song ended");
            playNext();
        });

        audioElement.addEventListener("play", () => {
            isPlaying = true;
            log("Playback started");
        });

        audioElement.addEventListener("pause", () => {
            isPlaying = false;
            log("Playback paused");
        });

        log("PlayerModule initialized");
    };

    // -----------------------------------------------------------------------------
    // Play a song
    // -----------------------------------------------------------------------------
    const play = (item) => {
        if (!audioElement) init();

        currentQueue.push(item);
        metrics.queueLength = currentQueue.length;
        currentIndex = currentQueue.length - 1;

        audioElement.src = getAudioURL(item);
        audioElement.play().catch((err) => console.error("Playback error:", err));

        metrics.playCount++;
        log(`Playing: ${item.title}`);
    };

    // -----------------------------------------------------------------------------
    // Get audio URL (placeholder)
    // -----------------------------------------------------------------------------
    const getAudioURL = (item) => {
        // This would connect to a real YouTube/audio API
        return `https://www.example.com/audio/${encodeURIComponent(item.video_id)}.mp3`;
    };

    // -----------------------------------------------------------------------------
    // Playback controls
    // -----------------------------------------------------------------------------
    const pause = () => {
        if (audioElement && isPlaying) audioElement.pause();
    };

    const resume = () => {
        if (audioElement && !isPlaying) audioElement.play();
    };

    const stop = () => {
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
            isPlaying = false;
            log("Playback stopped");
        }
    };

    const playNext = () => {
        if (currentIndex + 1 < currentQueue.length) {
            currentIndex++;
            const nextItem = currentQueue[currentIndex];
            audioElement.src = getAudioURL(nextItem);
            audioElement.play();
            log(`Playing next: ${nextItem.title}`);
        } else {
            log("End of queue");
        }
    };

    const playPrevious = () => {
        if (currentIndex > 0) {
            currentIndex--;
            const prevItem = currentQueue[currentIndex];
            audioElement.src = getAudioURL(prevItem);
            audioElement.play();
            log(`Playing previous: ${prevItem.title}`);
        }
    };

    // -----------------------------------------------------------------------------
    // Queue management
    // -----------------------------------------------------------------------------
    const addToQueue = (item) => {
        currentQueue.push(item);
        metrics.queueLength = currentQueue.length;
        log(`Added to queue: ${item.title}`);
    };

    const clearQueue = () => {
        currentQueue = [];
        currentIndex = -1;
        metrics.queueLength = 0;
        log("Queue cleared");
    };

    const shuffleQueue = () => {
        for (let i = currentQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentQueue[i], currentQueue[j]] = [currentQueue[j], currentQueue[i]];
        }
        log("Queue shuffled");
    };

    // -----------------------------------------------------------------------------
    // Metrics retrieval
    // -----------------------------------------------------------------------------
    const getMetrics = () => metrics;

    // -----------------------------------------------------------------------------
    // Initialization
    // -----------------------------------------------------------------------------
    const initModule = () => {
        init();
    };

    return {
        init: initModule,
        play,
        pause,
        resume,
        stop,
        playNext,
        playPrevious,
        addToQueue,
        clearQueue,
        shuffleQueue,
        getMetrics
    };
})();

// Auto-init
document.addEventListener("DOMContentLoaded", () => {
    PlayerModule.init();
});
