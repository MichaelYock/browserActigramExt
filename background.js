/**
 * Background Service Worker
 * Monitors browser activity and stores data in time epochs
 */

// Import storage manager (for Chrome MV3, we need to use importScripts)
if (typeof importScripts === 'function') {
    importScripts('indexeddb-manager.js', 'storage-manager.js');
}

// Activity tracking state
let currentEpoch = {
    startTime: null,
    activeSeconds: 0,
    totalSeconds: 0,
    epochDuration: 15 // minutes, will be loaded from settings
};

let isTracking = false;
let idleCheckInterval = null;

/**
 * Initialize the background worker
 */
async function initialize() {
    console.log('WebActigram: Initializing background worker');

    // Initialize storage
    await StorageManager.initialize();

    // Load settings
    const settings = await StorageManager.getSettings();
    currentEpoch.epochDuration = settings.epochDuration;

    // Try to restore current epoch if exists
    const savedEpoch = await StorageManager.getCurrentEpoch();
    if (savedEpoch) {
        currentEpoch = savedEpoch;
    } else {
        // Start new epoch
        startNewEpoch();
    }

    // Start activity monitoring
    startTracking();

    // Set up periodic epoch saving (every minute)
    chrome.alarms.create('saveEpoch', { periodInMinutes: 1 });

    // Set up daily cleanup
    chrome.alarms.create('cleanup', { periodInMinutes: 1440 }); // 24 hours

    console.log('WebActigram: Initialization complete');
}

/**
 * Start a new activity epoch
 */
function startNewEpoch() {
    currentEpoch = {
        startTime: Date.now(),
        activeSeconds: 0,
        totalSeconds: 0,
        epochDuration: currentEpoch.epochDuration
    };
}

/**
 * Start tracking browser activity
 */
function startTracking() {
    if (isTracking) return;

    isTracking = true;

    // Check idle state every 15 seconds
    idleCheckInterval = setInterval(checkIdleState, 15000);

    // Also listen for idle state changes
    chrome.idle.onStateChanged.addListener(handleIdleStateChange);

    console.log('WebActigram: Activity tracking started');
}

/**
 * Stop tracking browser activity
 */
function stopTracking() {
    if (!isTracking) return;

    isTracking = false;

    if (idleCheckInterval) {
        clearInterval(idleCheckInterval);
        idleCheckInterval = null;
    }

    chrome.idle.onStateChanged.removeListener(handleIdleStateChange);

    console.log('WebActigram: Activity tracking stopped');
}

/**
 * Check current idle state
 */
async function checkIdleState() {
    try {
        const settings = await StorageManager.getSettings();
        const state = await chrome.idle.queryState(settings.idleThreshold);

        // Update current epoch
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - currentEpoch.startTime) / 1000);
        currentEpoch.totalSeconds = elapsedSeconds;

        // If active, increment active seconds
        if (state === 'active') {
            // Estimate active seconds since last check (15 seconds)
            currentEpoch.activeSeconds += 15;
            // Cap at total seconds
            if (currentEpoch.activeSeconds > currentEpoch.totalSeconds) {
                currentEpoch.activeSeconds = currentEpoch.totalSeconds;
            }
        }

        // Check if epoch duration has elapsed
        const epochDurationMs = currentEpoch.epochDuration * 60 * 1000;
        if (now - currentEpoch.startTime >= epochDurationMs) {
            await finalizeEpoch();
        } else {
            // Save current epoch state
            await StorageManager.saveCurrentEpoch(currentEpoch);
        }
    } catch (error) {
        console.error('Error checking idle state:', error);
    }
}

/**
 * Handle idle state changes
 */
function handleIdleStateChange(state) {
    console.log('Idle state changed:', state);
    // The periodic check will handle the actual tracking
    // This listener is mainly for logging and potential future features
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
    if (alarm.name === 'saveEpoch') {
        // Periodic save of current epoch state
        await StorageManager.saveCurrentEpoch(currentEpoch);
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
