/**
 * Background Service Worker
 * Monitors browser activity and stores data in time epochs
 */

// Import storage manager (for Chrome MV3, we need to use importScripts)
if (typeof importScripts === 'function') {
    importScripts('indexeddb-manager.js', 'storage-manager.js');
}

// Activity tracking state - kept in memory for speed, but persisted to storage
let trackingState = {
    isTracking: false,
    lastCheckTime: Date.now(),
    lastState: 'active'
};

let currentEpoch = {
    startTime: null,
    activeSeconds: 0,
    totalSeconds: 0,
    epochDuration: 15 // minutes, will be loaded from settings
};

// Initialization state
let isInitialized = false;
let isInitializing = false;

/**
 * Initialize the background worker
 */
async function initialize() {
    if (isInitialized || isInitializing) return;
    isInitializing = true;

    console.log('WebActigram: Initializing background worker');

    try {
        // Initialize storage
        await StorageManager.initialize();

        // Load settings
        const settings = await StorageManager.getSettings();
        currentEpoch.epochDuration = settings.epochDuration;

        // Restore tracking state
        const savedState = await StorageManager.getTrackingState();
        if (savedState) {
            trackingState = savedState;
            // If we were tracking, we might need to account for time passed while SW was dead
            // For now, let's just resume from now to avoid huge jumps if browser was closed
            trackingState.lastCheckTime = Date.now();
        }

        // Try to restore current epoch if exists
        const savedEpoch = await StorageManager.getCurrentEpoch();
        if (savedEpoch) {
            currentEpoch = savedEpoch;
        } else {
            // Start new epoch
            startNewEpoch();
        }

        // Start activity monitoring if it was previously enabled or just always start it
        // The extension is designed to always track when installed
        startTracking();

        // Set up daily cleanup
        chrome.alarms.create('cleanup', { periodInMinutes: 1440 }); // 24 hours

        isInitialized = true;
        console.log('WebActigram: Initialization complete');
    } catch (error) {
        console.error('WebActigram: Initialization failed', error);
    } finally {
        isInitializing = false;
    }
}

/**
 * Start a new activity epoch
 */
function startNewEpoch() {
    currentEpoch = {
        startTime: Date.now(),
        activeSeconds: 0,
        totalSeconds: 0,
        epochDuration: currentEpoch.epochDuration || 15 // Fallback default
    };
}

/**
 * Start tracking browser activity
 */
async function startTracking() {
    if (trackingState.isTracking && isInitialized) return;

    trackingState.isTracking = true;
    trackingState.lastCheckTime = Date.now();

    // Get initial idle state
    const settings = await StorageManager.getSettings();
    const state = await chrome.idle.queryState(settings.idleThreshold);
    trackingState.lastState = state;

    await StorageManager.saveTrackingState(trackingState);

    // Use alarms for periodic checks (MV3 compliant)
    // 1 minute is the minimum reliable interval for released extensions
    chrome.alarms.create('activityHeartbeat', { periodInMinutes: 1 });

    // Also listen for idle state changes
    // We need to set the detection interval based on settings
    chrome.idle.setDetectionInterval(settings.idleThreshold);

    if (!chrome.idle.onStateChanged.hasListener(handleIdleStateChange)) {
        chrome.idle.onStateChanged.addListener(handleIdleStateChange);
    }

    console.log('WebActigram: Activity tracking started');
}

/**
 * Stop tracking browser activity
 */
async function stopTracking() {
    if (!trackingState.isTracking) return;

    trackingState.isTracking = false;
    await StorageManager.saveTrackingState(trackingState);

    chrome.alarms.clear('activityHeartbeat');

    if (chrome.idle.onStateChanged.hasListener(handleIdleStateChange)) {
        chrome.idle.onStateChanged.removeListener(handleIdleStateChange);
    }

    console.log('WebActigram: Activity tracking stopped');
}

/**
 * Update activity based on elapsed time
 */
async function updateActivity() {
    if (!isInitialized) return;

    const now = Date.now();
    const timeDeltaSeconds = Math.max(0, Math.floor((now - trackingState.lastCheckTime) / 1000));

    // Update current epoch total seconds
    if (!currentEpoch.startTime) {
        startNewEpoch();
    }

    const elapsedSeconds = Math.floor((now - currentEpoch.startTime) / 1000);
    currentEpoch.totalSeconds = elapsedSeconds;

    // If we were active, add to active seconds
    if (trackingState.lastState === 'active') {
        currentEpoch.activeSeconds += timeDeltaSeconds;

        // Cap at total seconds (sanity check)
        if (currentEpoch.activeSeconds > currentEpoch.totalSeconds) {
            currentEpoch.activeSeconds = currentEpoch.totalSeconds;
        }
    }

    // Update state
    trackingState.lastCheckTime = now;
    await StorageManager.saveTrackingState(trackingState);

    // Check if epoch duration has elapsed
    const epochDurationMs = currentEpoch.epochDuration * 60 * 1000;
    if (now - currentEpoch.startTime >= epochDurationMs) {
        await finalizeEpoch();
    } else {
        // Save current epoch state
        await StorageManager.saveCurrentEpoch(currentEpoch);
    }
}

/**
 * Check current idle state (Heartbeat)
 */
async function checkIdleState() {
    try {
        // First update activity based on previous state and time passed
        await updateActivity();

        // Then check current real state to ensure we are in sync
        const settings = await StorageManager.getSettings();
        const currentState = await chrome.idle.queryState(settings.idleThreshold);

        if (currentState !== trackingState.lastState) {
            trackingState.lastState = currentState;
            await StorageManager.saveTrackingState(trackingState);
        }
    } catch (error) {
        console.error('Error checking idle state:', error);
    }
}

/**
 * Handle idle state changes
 */
async function handleIdleStateChange(newState) {
    console.log('Idle state changed:', newState);

    // Update activity up to this point using the OLD state
    await updateActivity();

    // Now switch to NEW state
    trackingState.lastState = newState;
    await StorageManager.saveTrackingState(trackingState);
}

/**
 * Finalize current epoch and save it
 */
async function finalizeEpoch() {
    try {
        // Calculate activity score (0-100)
        const activityScore = currentEpoch.totalSeconds > 0
            ? Math.round((currentEpoch.activeSeconds / currentEpoch.totalSeconds) * 100)
            : 0;

        // Create epoch object
        const epoch = {
            timestamp: currentEpoch.startTime,
            activityScore: activityScore,
            epochDuration: currentEpoch.epochDuration
        };

        // Save to storage
        await StorageManager.saveActivityEpoch(epoch);

        console.log('epoch saved:', epoch);

        // Start new epoch
        startNewEpoch();
        await StorageManager.saveCurrentEpoch(currentEpoch);
    } catch (error) {
        console.error('Error finalize epoch:', error);
    }
}

/**
 * Handle alarms
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'activityHeartbeat') {
        await checkIdleState();
    } else if (alarm.name === 'cleanup') {
        // Daily cleanup of old data
        await StorageManager.cleanupOldData();
    }
});

/**
 * Handle extension installation/update
 */
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        console.log('WebActigram: Extension installed');
        await initialize();
    } else if (details.reason === 'update') {
        console.log('WebActigram: Extension updated');
        await initialize();
    }
});

/**
 * Handle browser startup
 */
chrome.runtime.onStartup.addListener(async () => {
    console.log('WebActigram: Browser started');
    await initialize();
});

/**
 * Handle extension icon click - open in new tab
 */
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: 'popup.html' });
});

// Initialize on script load (for service worker)
initialize();
