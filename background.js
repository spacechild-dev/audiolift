// AudioLift - Background Service Worker

// Handle keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-audiolift') {
    // Get active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;

    const tabId = tabs[0].id;

    // Get current settings
    const result = await chrome.storage.local.get(['globalSettings', `tabSettings_${tabId}`]);
    const currentSettings = {
      enabled: false,
      ...result.globalSettings,
      ...result[`tabSettings_${tabId}`]
    };

    // Toggle enabled state
    currentSettings.enabled = !currentSettings.enabled;

    // Save to storage
    await chrome.storage.local.set({
      [`tabSettings_${tabId}`]: currentSettings
    });

    // Send message to content script
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'updateSettings',
        settings: currentSettings
      });

      // Update badge
      updateBadge(tabId, currentSettings.enabled);

    } catch (error) {
      console.error('Error toggling AudioLift:', error);
    }
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getTabId') {
    sendResponse({ tabId: sender.tab?.id || null });
  }
  return true;
});

// Update badge when tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tabId = activeInfo.tabId;
  const result = await chrome.storage.local.get([`tabSettings_${tabId}`, 'globalSettings']);

  const settings = {
    enabled: false,
    ...result.globalSettings,
    ...result[`tabSettings_${tabId}`]
  };

  updateBadge(tabId, settings.enabled);
});

// Update badge on tab update (URL change)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    const result = await chrome.storage.local.get([`tabSettings_${tabId}`, 'globalSettings']);

    const settings = {
      enabled: false,
      ...result.globalSettings,
      ...result[`tabSettings_${tabId}`]
    };

    updateBadge(tabId, settings.enabled);
  }
});

// Update badge function
function updateBadge(tabId, enabled) {
  if (enabled) {
    chrome.action.setBadgeText({ text: 'ON', tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea', tabId });
  } else {
    chrome.action.setBadgeText({ text: '', tabId });
  }
}

// Initialize
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.local.set({
      globalSettings: {
        enabled: false,
        preamp: 0,
        bass: 0,
        mid: 0,
        treble: 0,
        compressionThreshold: -24,
        compressionRatio: 3,
        compressionKnee: 30,
        compressionAttack: 0.003,
        compressionRelease: 0.25
      }
    });

    // Enable side panel on all sites
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  }
});
