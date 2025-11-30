/**
 * Browser API Polyfill
 * Provides compatibility layer between Chrome and Firefox extension APIs
 */

// Create a unified browser API object
if (typeof browser === 'undefined') {
  // Chrome doesn't have 'browser' namespace, so we create it
  var browser = chrome;
}

// Promisify Chrome APIs for consistency with Firefox
if (typeof chrome !== 'undefined' && !chrome.storage.local.get.prototype) {
  // Wrap storage API
  const originalStorageGet = chrome.storage.local.get;
  const originalStorageSet = chrome.storage.local.set;
  const originalStorageRemove = chrome.storage.local.remove;
  const originalStorageClear = chrome.storage.local.clear;

  chrome.storage.local.get = function(keys) {
    return new Promise((resolve, reject) => {
      originalStorageGet.call(chrome.storage.local, keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  };

  chrome.storage.local.set = function(items) {
    return new Promise((resolve, reject) => {
      originalStorageSet.call(chrome.storage.local, items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  };

  chrome.storage.local.remove = function(keys) {
    return new Promise((resolve, reject) => {
      originalStorageRemove.call(chrome.storage.local, keys, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  };

  chrome.storage.local.clear = function() {
    return new Promise((resolve, reject) => {
      originalStorageClear.call(chrome.storage.local, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  };

  // Wrap storage.sync API
  const originalSyncGet = chrome.storage.sync.get;
  const originalSyncSet = chrome.storage.sync.set;

  chrome.storage.sync.get = function(keys) {
    return new Promise((resolve, reject) => {
      originalSyncGet.call(chrome.storage.sync, keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  };

  chrome.storage.sync.set = function(items) {
    return new Promise((resolve, reject) => {
      originalSyncSet.call(chrome.storage.sync, items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  };

  // Wrap idle API
  const originalIdleQueryState = chrome.idle.queryState;

  chrome.idle.queryState = function(detectionIntervalInSeconds) {
    return new Promise((resolve, reject) => {
      originalIdleQueryState.call(chrome.idle, detectionIntervalInSeconds, (state) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(state);
        }
      });
    });
  };
}
