// AudioLift - Popup UI Logic (v1.1.0)

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

    this.presets = {
      flat: {
        name: 'Flat',
        icon: '⚖️',
        preamp: 0,
        bass: 0,
        mid: 0,
        treble: 0,
        compressionThreshold: -24,
        compressionRatio: 1,
        compressionKnee: 30
      },
      audiophile: {
        name: 'Audiophile',
        icon: '🎧',
        preamp: 0,
        bass: 1,
        mid: 0.5,
        treble: 1,
        compressionThreshold: -40,
        compressionRatio: 1.5,
        compressionKnee: 40
      },
      movie: {
        name: 'Movie',
        icon: '🎬',
        preamp: 2,
        bass: 4,
        mid: -2,
        treble: 2,
        compressionThreshold: -30,
        compressionRatio: 4,
        compressionKnee: 20
      },
      dialogue: {
        name: 'Dialogue',
        icon: '🗣️',
        preamp: 4,
        bass: -3,
        mid: 6,
        treble: 3,
        compressionThreshold: -35,
        compressionRatio: 6,
        compressionKnee: 15
      },
      music: {
        name: 'Music',
        icon: '🎵',
        preamp: 1,
        bass: 3,
        mid: 1,
        treble: 2,
        compressionThreshold: -24,
        compressionRatio: 2,
        compressionKnee: 30
      },
      rock: {
        name: 'Rock',
        icon: '🎸',
        preamp: 2,
        bass: 5,
        mid: 2,
        treble: 4,
        compressionThreshold: -20,
        compressionRatio: 3,
        compressionKnee: 25
      },
      classical: {
        name: 'Classical',
        icon: '🎻',
        preamp: 0,
        bass: 1,
        mid: -1,
        treble: 0,
        compressionThreshold: -35,
        compressionRatio: 1.5,
        compressionKnee: 35
      },
      jazz: {
        name: 'Jazz',
        icon: '🎷',
        preamp: 1,
        bass: 2,
        mid: 1,
        treble: 1,
        compressionThreshold: -28,
        compressionRatio: 2,
        compressionKnee: 30
      },
      podcast: {
        name: 'Podcast',
        icon: '🎙️',
        preamp: 3,
        bass: -2,
        mid: 5,
        treble: 2,
        compressionThreshold: -32,
        compressionRatio: 5,
        compressionKnee: 18
      },
      gaming: {
        name: 'Gaming',
        icon: '🎮',
        preamp: 3,
        bass: 6,
        mid: 0,
        treble: 3,
        compressionThreshold: -25,
        compressionRatio: 3,
        compressionKnee: 22
      },
      night: {
        name: 'Night Mode',
        icon: '🌙',
        preamp: 2,
        bass: 2,
        mid: 3,
        treble: 1,
        compressionThreshold: -38,
        compressionRatio: 8,
        compressionKnee: 12
      },
      bassboost: {
        name: 'Bass+',
        icon: '🔊',
        preamp: 0,
        bass: 8,
        mid: -1,
        treble: 1,
        compressionThreshold: -24,
        compressionRatio: 3,
        compressionKnee: 30
      }
    };

    this.autoSaveTimer = null;
    this.domain = null;

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
  }

  setupEventListeners() {
    // Master toggle
    document.getElementById('masterToggle').addEventListener('change', (e) => {
      this.currentSettings.enabled = e.target.checked;
      this.updateControlsState();
      this.applySettings();
      this.autoSaveSettings();
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

    // Save buttons (manual save options)
    const saveGlobal = document.getElementById('saveGlobal');
    const saveTab = document.getElementById('saveTab');

    if (saveGlobal) {
      saveGlobal.addEventListener('click', () => {
        this.saveGlobalSettings();
      });
    }

    if (saveTab) {
      saveTab.addEventListener('click', () => {
        this.saveTabSettings();
      });
    }

    // Help modal
    const helpBtn = document.getElementById('compressionHelp');
    const helpModal = document.getElementById('helpModal');
    const modalClose = document.querySelector('.modal-close');

    if (helpBtn && helpModal) {
      helpBtn.addEventListener('click', () => {
        helpModal.classList.remove('hidden');
      });

      modalClose.addEventListener('click', () => {
        helpModal.classList.add('hidden');
      });

      helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
          helpModal.classList.add('hidden');
        }
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
        valueElement.textContent = `${value}`;
        break;
      case 'ratio':
        valueElement.textContent = `${value}:1`;
        break;
      case 'knee':
        valueElement.textContent = `${value}`;
        break;
    }
  }

  applyPreset(presetName) {
    const preset = this.presets[presetName];
    if (!preset) return;

    // Update settings
    Object.assign(this.currentSettings, preset);

    // Update UI
    this.updateUI();

    // Highlight active preset
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-preset="${presetName}"]`).classList.add('active');

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
    if (this.currentSettings.enabled) {
      controlsContainer.classList.remove('disabled');
    } else {
      controlsContainer.classList.add('disabled');
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

      console.log(`AudioLift: Auto-saved settings for ${this.domain}`);
    }, 500);
  }

  async saveGlobalSettings() {
    await chrome.storage.local.set({
      globalSettings: { ...this.currentSettings }
    });
    this.showNotification('💾 Saved as default');
  }

  async saveTabSettings() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = new URL(tabs[0].url);
    const domain = url.hostname;

    await chrome.storage.local.set({
      [`tabSettings_${this.tabId}`]: { ...this.currentSettings },
      [`domainSettings_${domain}`]: { ...this.currentSettings }
    });

    this.showNotification(`🌐 Saved for ${domain}`);
  }

  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideDown 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 2 seconds
    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
  }
`;
document.head.appendChild(style);

// Initialize UI
const audioLiftUI = new AudioLiftUI();
