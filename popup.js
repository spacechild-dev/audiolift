// AudioLift - Popup UI Logic (v2.0.0 - Chrome Minimal Design)

class AudioLiftUI {
  constructor() {
    this.tabId = null;
    this.currentSettings = {
      enabled: false,
      preamp: 0,
      bass: 0,
      mid: 0,
      treble: 0,
      compressionThreshold: -24,
      compressionRatio: 3,
      compressionKnee: 30
    };

    // Expanded preset library (20 presets)
    this.presets = {
      flat: { name: 'Flat', preamp: 0, bass: 0, mid: 0, treble: 0, compressionThreshold: -24, compressionRatio: 1, compressionKnee: 30 },
      audiophile: { name: 'Audiophile', preamp: 0, bass: 1, mid: 0.5, treble: 1, compressionThreshold: -40, compressionRatio: 1.5, compressionKnee: 40 },
      movie: { name: 'Movie', preamp: 2, bass: 4, mid: -2, treble: 2, compressionThreshold: -30, compressionRatio: 4, compressionKnee: 20 },
      dialogue: { name: 'Dialogue', preamp: 4, bass: -3, mid: 6, treble: 3, compressionThreshold: -35, compressionRatio: 6, compressionKnee: 15 },
      music: { name: 'Music', preamp: 1, bass: 3, mid: 1, treble: 2, compressionThreshold: -24, compressionRatio: 2, compressionKnee: 30 },
      rock: { name: 'Rock', preamp: 2, bass: 5, mid: 2, treble: 4, compressionThreshold: -20, compressionRatio: 3, compressionKnee: 25 },
      classical: { name: 'Classical', preamp: 0, bass: 1, mid: -1, treble: 0, compressionThreshold: -35, compressionRatio: 1.5, compressionKnee: 35 },
      jazz: { name: 'Jazz', preamp: 1, bass: 2, mid: 1, treble: 1, compressionThreshold: -28, compressionRatio: 2, compressionKnee: 30 },
      electronic: { name: 'Electronic', preamp: 3, bass: 7, mid: -1, treble: 5, compressionThreshold: -18, compressionRatio: 4, compressionKnee: 20 },
      hiphop: { name: 'Hip Hop', preamp: 2, bass: 8, mid: 0, treble: 2, compressionThreshold: -22, compressionRatio: 5, compressionKnee: 18 },
      metal: { name: 'Metal', preamp: 3, bass: 6, mid: 3, treble: 6, compressionThreshold: -15, compressionRatio: 4, compressionKnee: 15 },
      acoustic: { name: 'Acoustic', preamp: 1, bass: 0, mid: 2, treble: 1, compressionThreshold: -30, compressionRatio: 2, compressionKnee: 35 },
      podcast: { name: 'Podcast', preamp: 3, bass: -2, mid: 5, treble: 2, compressionThreshold: -32, compressionRatio: 5, compressionKnee: 18 },
      gaming: { name: 'Gaming', preamp: 3, bass: 6, mid: 0, treble: 3, compressionThreshold: -25, compressionRatio: 3, compressionKnee: 22 },
      night: { name: 'Night', preamp: 2, bass: 2, mid: 3, treble: 1, compressionThreshold: -38, compressionRatio: 8, compressionKnee: 12 },
      bassboost: { name: 'Bass+', preamp: 0, bass: 8, mid: -1, treble: 1, compressionThreshold: -24, compressionRatio: 3, compressionKnee: 30 },
      vocal: { name: 'Vocal', preamp: 3, bass: -4, mid: 8, treble: 4, compressionThreshold: -32, compressionRatio: 6, compressionKnee: 16 },
      cinematic: { name: 'Cinematic', preamp: 2, bass: 5, mid: -1, treble: 3, compressionThreshold: -28, compressionRatio: 5, compressionKnee: 22 },
      radio: { name: 'Radio', preamp: 4, bass: -3, mid: 7, treble: 3, compressionThreshold: -30, compressionRatio: 7, compressionKnee: 14 },
      lofi: { name: 'Lo-Fi', preamp: 1, bass: 4, mid: -2, treble: -3, compressionThreshold: -26, compressionRatio: 3, compressionKnee: 25 }
    };

    this.autoSaveTimer = null;
    this.domain = null;
    this.audioInfoUpdateInterval = null;

    this.init();
  }

  async init() {
    // Get current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    this.tabId = tabs[0].id;

    // Get domain
    try {
      const url = new URL(tabs[0].url);
      this.domain = url.hostname;
    } catch (e) {
      this.domain = 'unknown';
    }

    // Setup event listeners
    this.setupEventListeners();

    // Load settings
    await this.loadSettings();

    // Update UI
    this.updateUI();

    // Request audio info
    this.requestAudioInfo();

    // Update audio info periodically
    this.audioInfoUpdateInterval = setInterval(() => {
      this.requestAudioInfo();
    }, 2000);
  }

  setupEventListeners() {
    // Master toggle
    document.getElementById('masterToggle').addEventListener('change', (e) => {
      this.currentSettings.enabled = e.target.checked;
      this.updateControlsState();
      this.applySettings();
      this.autoSaveSettings();

      // Show/hide audio info when enabled
      if (this.currentSettings.enabled) {
        this.requestAudioInfo();
      }
    });

    // Sliders
    const sliders = ['preamp', 'bass', 'mid', 'treble', 'threshold', 'ratio', 'knee'];
    sliders.forEach(id => {
      const slider = document.getElementById(id);
      slider.addEventListener('input', (e) => {
        this.handleSliderChange(id, parseFloat(e.target.value));
      });
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.target.dataset.preset;
        this.applyPreset(preset);
      });
    });

    // Help modal
    const helpBtn = document.getElementById('compressionHelp');
    const helpModal = document.getElementById('helpModal');
    const modalClose = helpModal.querySelector('.modal-close');
    const modalOverlay = helpModal.querySelector('.modal-overlay');

    if (helpBtn && helpModal) {
      helpBtn.addEventListener('click', () => {
        helpModal.classList.remove('hidden');
      });

      modalClose.addEventListener('click', () => {
        helpModal.classList.add('hidden');
      });

      modalOverlay.addEventListener('click', () => {
        helpModal.classList.add('hidden');
      });
    }
  }

  handleSliderChange(id, value) {
    const mapping = {
      preamp: 'preamp',
      bass: 'bass',
      mid: 'mid',
      treble: 'treble',
      threshold: 'compressionThreshold',
      ratio: 'compressionRatio',
      knee: 'compressionKnee'
    };

    this.currentSettings[mapping[id]] = value;
    this.updateSliderValue(id, value);
    this.applySettings();
    this.autoSaveSettings();
  }

  updateSliderValue(id, value) {
    const valueElement = document.getElementById(`${id}Value`);
    if (!valueElement) return;

    switch (id) {
      case 'preamp':
        valueElement.textContent = `${value >= 0 ? '+' : ''}${value} dB`;
        break;
      case 'bass':
      case 'mid':
      case 'treble':
        valueElement.textContent = `${value >= 0 ? '+' : ''}${value}`;
        break;
      case 'threshold':
        valueElement.textContent = `${value} dB`;
        break;
      case 'ratio':
        valueElement.textContent = `${value}:1`;
        break;
      case 'knee':
        valueElement.textContent = `${value} dB`;
        break;
    }
  }

  applyPreset(presetName) {
    const preset = this.presets[presetName];
    if (!preset) return;

    // Update settings (excluding name)
    const { name, ...presetSettings } = preset;
    Object.assign(this.currentSettings, presetSettings);

    // Update UI
    this.updateUI();

    // Highlight active preset
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-preset="${presetName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // Apply to content script
    this.applySettings();
    this.autoSaveSettings();
  }

  async loadSettings() {
    const result = await chrome.storage.local.get([
      'globalSettings',
      `domainSettings_${this.domain}`,
      `tabSettings_${this.tabId}`
    ]);

    // Priority: tab-specific > domain-specific > global
    this.currentSettings = {
      ...this.currentSettings,
      ...result.globalSettings,
      ...result[`domainSettings_${this.domain}`],
      ...result[`tabSettings_${this.tabId}`]
    };
  }

  updateUI() {
    // Update master toggle
    document.getElementById('masterToggle').checked = this.currentSettings.enabled;
    this.updateControlsState();

    // Update all sliders
    document.getElementById('preamp').value = this.currentSettings.preamp;
    document.getElementById('bass').value = this.currentSettings.bass;
    document.getElementById('mid').value = this.currentSettings.mid;
    document.getElementById('treble').value = this.currentSettings.treble;
    document.getElementById('threshold').value = this.currentSettings.compressionThreshold;
    document.getElementById('ratio').value = this.currentSettings.compressionRatio;
    document.getElementById('knee').value = this.currentSettings.compressionKnee;

    // Update value displays
    this.updateSliderValue('preamp', this.currentSettings.preamp);
    this.updateSliderValue('bass', this.currentSettings.bass);
    this.updateSliderValue('mid', this.currentSettings.mid);
    this.updateSliderValue('treble', this.currentSettings.treble);
    this.updateSliderValue('threshold', this.currentSettings.compressionThreshold);
    this.updateSliderValue('ratio', this.currentSettings.compressionRatio);
    this.updateSliderValue('knee', this.currentSettings.compressionKnee);
  }

  updateControlsState() {
    const controlsContainer = document.getElementById('controls');
    const audioInfoPanel = document.getElementById('audioInfo');

    if (this.currentSettings.enabled) {
      controlsContainer.classList.remove('disabled');
      if (audioInfoPanel) {
        audioInfoPanel.classList.remove('hidden');
      }
    } else {
      controlsContainer.classList.add('disabled');
      if (audioInfoPanel) {
        audioInfoPanel.classList.add('hidden');
      }
    }
  }

  async applySettings() {
    try {
      // Send message to content script
      await chrome.tabs.sendMessage(this.tabId, {
        type: 'updateSettings',
        settings: this.currentSettings
      });
    } catch (error) {
      console.error('Error applying settings:', error);
    }
  }

  autoSaveSettings() {
    // Debounce auto-save (wait 500ms after last change)
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(async () => {
      // Auto-save to both global and domain-specific storage
      await chrome.storage.local.set({
        globalSettings: { ...this.currentSettings },
        [`domainSettings_${this.domain}`]: { ...this.currentSettings }
      });
    }, 500);
  }

  async requestAudioInfo() {
    try {
      const response = await chrome.tabs.sendMessage(this.tabId, {
        type: 'getAudioInfo'
      });

      if (response && response.audioInfo) {
        this.updateAudioInfo(response.audioInfo);
      }
    } catch (error) {
      // Silently fail if no audio info available
    }
  }

  updateAudioInfo(info) {
    const sampleRateEl = document.getElementById('sampleRate');
    const channelsEl = document.getElementById('channels');
    const codecEl = document.getElementById('codec');
    const bitrateEl = document.getElementById('bitrate');
    const durationEl = document.getElementById('duration');

    if (sampleRateEl) {
      sampleRateEl.textContent = info.sampleRate ? `${info.sampleRate} Hz` : '-';
    }
    if (channelsEl) {
      channelsEl.textContent = info.channels || '-';
    }
    if (codecEl) {
      codecEl.textContent = info.codec || 'Unknown';
    }
    if (bitrateEl) {
      bitrateEl.textContent = info.bitrate || 'Unknown';
    }
    if (durationEl) {
      durationEl.textContent = info.duration || '-';
    }
  }
}

// Initialize UI
const audioLiftUI = new AudioLiftUI();

// Cleanup on unload
window.addEventListener('unload', () => {
  if (audioLiftUI.audioInfoUpdateInterval) {
    clearInterval(audioLiftUI.audioInfoUpdateInterval);
  }
});
