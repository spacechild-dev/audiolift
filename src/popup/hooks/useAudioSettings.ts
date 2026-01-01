import { useState, useEffect, useCallback } from 'react';
import { AudioLiftSettings, defaultSettings, AudioInfo } from '../../types';

export const useAudioSettings = () => {
  const [settings, setSettings] = useState<AudioLiftSettings>(defaultSettings);
  const [domain, setDomain] = useState<string>('unknown');
  const [tabId, setTabId] = useState<number | null>(null);
  const [audioInfo, setAudioInfo] = useState<AudioInfo>({
    sampleRate: null,
    channels: null,
    bitDepth: null,
    codec: null,
    bitrate: null,
    duration: null
  });
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Load initial state and listen for tab changes
  useEffect(() => {
    const updateActiveTab = async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0 && tabs[0].id) {
        const currentTabId = tabs[0].id;
        setTabId(currentTabId);

        let currentDomain = 'unknown';
        try {
          if (tabs[0].url) {
            currentDomain = new URL(tabs[0].url).hostname;
          }
        } catch (e) {
          console.error('Invalid URL');
        }
        setDomain(currentDomain);

        // Load settings
        const result = await chrome.storage.local.get([
          'globalSettings',
          `domainSettings_${currentDomain}`,
          `domainPreset_${currentDomain}`
        ]);

        const mergedSettings = {
          ...defaultSettings,
          ...result.globalSettings,
          ...result[`domainSettings_${currentDomain}`]
        };

        setSettings(mergedSettings);
        setActivePreset(result[`domainPreset_${currentDomain}`] || null);
      }
    };

    updateActiveTab();

    // Listen for tab switching
    const onActivated = () => updateActiveTab();
    chrome.tabs.onActivated.addListener(onActivated);

    // Listen for navigation (URL changes)
    const onUpdated = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (changeInfo.status === 'complete' || changeInfo.url) {
        // Only update if it's the active tab (handled by updateActiveTab query, but we trigger it)
        chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => {
          if (tabs[0] && tabs[0].id === updatedTabId) {
            updateActiveTab();
          }
        });
      }
    };
    chrome.tabs.onUpdated.addListener(onUpdated);

    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };
  }, []);

  // Sync to Content Script & Storage
  const updateSettings = useCallback(async (newSettings: Partial<AudioLiftSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Persist to storage (debounced ideally, but direct for now is fine for local state)
      if (domain !== 'unknown') {
        chrome.storage.local.set({
          [`domainSettings_${domain}`]: updated,
          globalSettings: updated // Optional: decide if global should track local
        });
      }

      // Send to Tab
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          type: 'updateSettings',
          settings: updated
        }).catch(() => {
          // Tab might be closed or restricted
        });
      }

      return updated;
    });
  }, [domain, tabId]);

  // Apply Preset
  const applyPreset = useCallback(async (presetName: string, presetSettings: Partial<AudioLiftSettings>) => {
    setActivePreset(presetName);
    if (domain !== 'unknown') {
      await chrome.storage.local.set({ [`domainPreset_${domain}`]: presetName });
    }
    updateSettings(presetSettings);
  }, [domain, updateSettings]);

  // Poll Audio Info
  useEffect(() => {
    if (!tabId) return;

    const fetchInfo = () => {
      chrome.tabs.sendMessage(tabId, { type: 'getAudioInfo' })
        .then(response => {
          if (response && response.audioInfo) {
            setAudioInfo(response.audioInfo);
          }
        })
        .catch(() => {
          // Content script not ready
        });
    };

    fetchInfo();
    const interval = setInterval(fetchInfo, 2000);
    return () => clearInterval(interval);
  }, [tabId]);

  return {
    settings,
    updateSettings,
    audioInfo,
    activePreset,
    applyPreset,
    domain
  };
};
