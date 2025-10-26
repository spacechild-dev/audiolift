// AudioLift - Popup UI Logic (v2.2.0 - 10-Band EQ + Spectrum)

class AudioLiftUI {
  constructor() {
    this.tabId = null;
    this.currentSettings = {
      enabled: false,
      preamp: 0,
      eq32: 0,
      eq64: 0,
      eq125: 0,
      eq250: 0,
      eq500: 0,
      eq1k: 0,
      eq2k: 0,
      eq4k: 0,
      eq8k: 0,
      eq16k: 0,
      compressionThreshold: -24,
      compressionRatio: 3,
      compressionKnee: 30
    };

    this.spectrumCanvas = null;
    this.spectrumCtx = null;
    this.animationFrameId = null;

    // Simplified presets for 10-band (bass/mid/treble distributed)
    this.presets = {
      flat: { name: 'Flat', preamp: 0, eq32: 0, eq64: 0, eq125: 0, eq250: 0, eq500: 0, eq1k: 0, eq2k: 0, eq4k: 0, eq8k: 0, eq16k: 0, compressionThreshold: -24, compressionRatio: 1, compressionKnee: 30 },
      audiophile: { name: 'Audiophile', preamp: 0, eq32: 1, eq64: 1, eq125: 0.5, eq250: 0, eq500: 0.5, eq1k: 0.5, eq2k: 0.5, eq4k: 1, eq8k: 1, eq16k: 0.5, compressionThreshold: -40, compressionRatio: 1.5, compressionKnee: 40 },
      movie: { name: 'Movie', preamp: 2, eq32: 4, eq64: 4, eq125: 3, eq250: 2, eq500: -2, eq1k: -2, eq2k: 0, eq4k: 2, eq8k: 2, eq16k: 1, compressionThreshold: -30, compressionRatio: 4, compressionKnee: 20 },
      dialogue: { name: 'Dialogue', preamp: 4, eq32: -3, eq64: -3, eq125: -2, eq250: -1, eq500: 6, eq1k: 6, eq2k: 5, eq4k: 3, eq8k: 2, eq16k: 1, compressionThreshold: -35, compressionRatio: 6, compressionKnee: 15 },
      music: { name: 'Music', preamp: 1, eq32: 3, eq64: 3, eq125: 2, eq250: 1, eq500: 1, eq1k: 1, eq2k: 1, eq4k: 2, eq8k: 2, eq16k: 1, compressionThreshold: -24, compressionRatio: 2, compressionKnee: 30 },
      rock: { name: 'Rock', preamp: 2, eq32: 5, eq64: 5, eq125: 4, eq250: 2, eq500: 2, eq1k: 2, eq2k: 3, eq4k: 4, eq8k: 4, eq16k: 3, compressionThreshold: -20, compressionRatio: 3, compressionKnee: 25 },
      classical: { name: 'Classical', preamp: 0, eq32: 1, eq64: 1, eq125: 0.5, eq250: 0, eq500: -1, eq1k: -1, eq2k: -0.5, eq4k: 0, eq8k: 0.5, eq16k: 1, compressionThreshold: -35, compressionRatio: 1.5, compressionKnee: 35 },
      jazz: { name: 'Jazz', preamp: 1, eq32: 2, eq64: 2, eq125: 1.5, eq250: 1, eq500: 1, eq1k: 1, eq2k: 1, eq4k: 1, eq8k: 1.5, eq16k: 1, compressionThreshold: -28, compressionRatio: 2, compressionKnee: 30 },
      electronic: { name: 'Electronic', preamp: 3, eq32: 7, eq64: 7, eq125: 5, eq250: 3, eq500: -1, eq1k: -1, eq2k: 2, eq4k: 5, eq8k: 6, eq16k: 5, compressionThreshold: -18, compressionRatio: 4, compressionKnee: 20 },
      hiphop: { name: 'Hip Hop', preamp: 2, eq32: 8, eq64: 8, eq125: 6, eq250: 4, eq500: 0, eq1k: 0, eq2k: 1, eq4k: 2, eq8k: 2, eq16k: 1, compressionThreshold: -22, compressionRatio: 5, compressionKnee: 18 },
      metal: { name: 'Metal', preamp: 3, eq32: 6, eq64: 6, eq125: 5, eq250: 3, eq500: 3, eq1k: 3, eq2k: 4, eq4k: 6, eq8k: 6, eq16k: 5, compressionThreshold: -15, compressionRatio: 4, compressionKnee: 15 },
      acoustic: { name: 'Acoustic', preamp: 1, eq32: 0, eq64: 0, eq125: 1, eq250: 2, eq500: 2, eq1k: 2, eq2k: 1.5, eq4k: 1, eq8k: 1, eq16k: 0.5, compressionThreshold: -30, compressionRatio: 2, compressionKnee: 35 },
      podcast: { name: 'Podcast', preamp: 3, eq32: -2, eq64: -2, eq125: -1, eq250: 0, eq500: 5, eq1k: 5, eq2k: 4, eq4k: 2, eq8k: 1, eq16k: 0, compressionThreshold: -32, compressionRatio: 5, compressionKnee: 18 },
      gaming: { name: 'Gaming', preamp: 3, eq32: 6, eq64: 6, eq125: 5, eq250: 3, eq500: 0, eq1k: 0, eq2k: 1, eq4k: 3, eq8k: 3, eq16k: 2, compressionThreshold: -25, compressionRatio: 3, compressionKnee: 22 },
      night: { name: 'Night', preamp: 2, eq32: 2, eq64: 2, eq125: 2, eq250: 2, eq500: 3, eq1k: 3, eq2k: 2, eq4k: 1, eq8k: 1, eq16k: 0.5, compressionThreshold: -38, compressionRatio: 8, compressionKnee: 12 },
      bassboost: { name: 'Bass+', preamp: 0, eq32: 8, eq64: 8, eq125: 7, eq250: 5, eq500: -1, eq1k: -1, eq2k: 0, eq4k: 1, eq8k: 1, eq16k: 0.5, compressionThreshold: -24, compressionRatio: 3, compressionKnee: 30 },
      vocal: { name: 'Vocal', preamp: 3, eq32: -4, eq64: -4, eq125: -3, eq250: -2, eq500: 8, eq1k: 8, eq2k: 7, eq4k: 4, eq8k: 3, eq16k: 1, compressionThreshold: -32, compressionRatio: 6, compressionKnee: 16 },
      cinematic: { name: 'Cinematic', preamp: 2, eq32: 5, eq64: 5, eq125: 4, eq250: 2, eq500: -1, eq1k: -1, eq2k: 1, eq4k: 3, eq8k: 3, eq16k: 2, compressionThreshold: -28, compressionRatio: 5, compressionKnee: 22 },
      radio: { name: 'Radio', preamp: 4, eq32: -3, eq64: -3, eq125: -2, eq250: 0, eq500: 7, eq1k: 7, eq2k: 6, eq4k: 3, eq8k: 2, eq16k: 0, compressionThreshold: -30, compressionRatio: 7, compressionKnee: 14 },
      lofi: { name: 'Lo-Fi', preamp: 1, eq32: 4, eq64: 4, eq125: 3, eq250: 2, eq500: -2, eq1k: -2, eq2k: -1, eq4k: -3, eq8k: -3, eq16k: -4, compressionThreshold: -26, compressionRatio: 3, compressionKnee: 25 }
    };

    this.autoSaveTimer = null;
    this.domain = null;
    this.audioInfoUpdateInterval = null;

    this.init();
  }

  async init() {
    // Detect popup vs side panel mode
    this.detectMode();

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

    // Setup footer links
    this.setupFooterLinks();

    // Setup spectrum analyzer
    this.setupSpectrumAnalyzer();
  }

  detectMode() {
    // Simple detection: side panel is usually wider
    const isWide = window.innerWidth > 380;
    document.body.classList.add(isWide ? 'sidepanel-mode' : 'popup-mode');
  }

  setupFooterLinks() {
    const links = {
      websiteLink: '#daiquiri.dev',
      githubLink: '#github-sponsors',
      coffeeLink: '#buymeacoffee'
    };

    Object.entries(links).forEach(([id, url]) => {
      const element = document.getElementById(id);
      if (element && url !== '#') {
        element.href = url;
      }
    });
  }

  setupSpectrumAnalyzer() {
    this.spectrumCanvas = document.getElementById('spectrumCanvas');
    if (!this.spectrumCanvas) return;

    this.spectrumCtx = this.spectrumCanvas.getContext('2d');

    // Request spectrum data periodically
    setInterval(async () => {
      try {
        const response = await chrome.tabs.sendMessage(this.tabId, {
          type: 'getSpectrumData'
        });
        if (response && response.data) {
          this.drawSpectrum(response.data);
        }
      } catch (e) {
        // Silently fail
      }
    }, 50); // 20fps
  }

  drawSpectrum(dataArray) {
    if (!this.spectrumCtx || !dataArray) return;

    const canvas = this.spectrumCanvas;
    const ctx = this.spectrumCtx;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    ctx.fillStyle = isDark ? '#292a2d' : '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // Draw bars
    const barWidth = width / dataArray.length;
    const barColor = isDark ? '#8ab4f8' : '#1a73e8';

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height;
      ctx.fillStyle = barColor;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
    }
  }

  setupEventListeners() {
    // Master toggle
    document.getElementById('masterToggle').addEventListener('change', (e) => {
      this.currentSettings.enabled = e.target.checked;
      this.updateControlsState();
      this.applySettings();
      this.autoSaveSettings();
    });

    // Advanced button (popup only)
    const advancedBtn = document.getElementById('advancedBtn');
    if (advancedBtn) {
      advancedBtn.addEventListener('click', () => {
        chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
      });
    }

    // Sliders - 10-band EQ
    const eqBands = ['eq32', 'eq64', 'eq125', 'eq250', 'eq500', 'eq1k', 'eq2k', 'eq4k', 'eq8k', 'eq16k'];
    const otherSliders = ['preamp', 'threshold', 'ratio', 'knee'];

    [...eqBands, ...otherSliders].forEach(id => {
      const slider = document.getElementById(id);
      if (slider) {
        slider.addEventListener('input', (e) => {
          this.handleSliderChange(id, parseFloat(e.target.value));
        });
      }
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
    if (helpBtn && helpModal) {
      const modalClose = helpModal.querySelector('.modal-close');
      const modalOverlay = helpModal.querySelector('.modal-overlay');

      helpBtn.addEventListener('click', () => {
        helpModal.classList.remove('hidden');
      });

      modalClose?.addEventListener('click', () => {
        helpModal.classList.add('hidden');
      });

      modalOverlay?.addEventListener('click', () => {
        helpModal.classList.add('hidden');
      });
    }

    // Custom preset handlers
    const savePresetBtn = document.getElementById('savePreset');
    const deletePresetBtn = document.getElementById('deletePreset');

    if (savePresetBtn) {
      savePresetBtn.addEventListener('click', () => this.saveCustomPreset());
    }
    if (deletePresetBtn) {
      deletePresetBtn.addEventListener('click', () => this.deleteCustomPreset());
    }
  }

  handleSliderChange(id, value) {
    const mapping = {
      preamp: 'preamp',
      threshold: 'compressionThreshold',
      ratio: 'compressionRatio',
      knee: 'compressionKnee',
      eq32: 'eq32',
      eq64: 'eq64',
      eq125: 'eq125',
      eq250: 'eq250',
      eq500: 'eq500',
      eq1k: 'eq1k',
      eq2k: 'eq2k',
      eq4k: 'eq4k',
      eq8k: 'eq8k',
      eq16k: 'eq16k'
    };

    this.currentSettings[mapping[id]] = value;
    this.updateSliderValue(id, value);
    this.applySettings();
    this.autoSaveSettings();
  }

  updateSliderValue(id, value) {
    const valueElement = document.getElementById(`${id}Value`);
    if (!valueElement) return;

    if (id === 'preamp') {
      valueElement.textContent = `${value >= 0 ? '+' : ''}${value} dB`;
    } else if (id.startsWith('eq')) {
      valueElement.textContent = `${value >= 0 ? '+' : ''}${value}`;
    } else if (id === 'threshold') {
      valueElement.textContent = `${value} dB`;
    } else if (id === 'ratio') {
      valueElement.textContent = `${value}:1`;
    } else if (id === 'knee') {
      valueElement.textContent = `${value} dB`;
    }
  }

  applyPreset(presetName) {
    const preset = this.presets[presetName];
    if (!preset) return;

    const { name, ...presetSettings } = preset;
    Object.assign(this.currentSettings, presetSettings);

    this.updateUI();

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-preset="${presetName}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    this.applySettings();
    this.autoSaveSettings();
  }

  async loadSettings() {
    const result = await chrome.storage.local.get([
      'globalSettings',
      `domainSettings_${this.domain}`,
      `tabSettings_${this.tabId}`
    ]);

    this.currentSettings = {
      ...this.currentSettings,
      ...result.globalSettings,
      ...result[`domainSettings_${this.domain}`],
      ...result[`tabSettings_${this.tabId}`]
    };
  }

  updateUI() {
    document.getElementById('masterToggle').checked = this.currentSettings.enabled;
    this.updateControlsState();

    // Update all EQ sliders
    const eqBands = ['eq32', 'eq64', 'eq125', 'eq250', 'eq500', 'eq1k', 'eq2k', 'eq4k', 'eq8k', 'eq16k'];
    eqBands.forEach(band => {
      const slider = document.getElementById(band);
      if (slider) {
        slider.value = this.currentSettings[band] || 0;
        this.updateSliderValue(band, this.currentSettings[band] || 0);
      }
    });

    // Update other sliders
    document.getElementById('preamp').value = this.currentSettings.preamp;
    document.getElementById('threshold').value = this.currentSettings.compressionThreshold;
    document.getElementById('ratio').value = this.currentSettings.compressionRatio;
    document.getElementById('knee').value = this.currentSettings.compressionKnee;

    this.updateSliderValue('preamp', this.currentSettings.preamp);
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
      await chrome.tabs.sendMessage(this.tabId, {
        type: 'updateSettings',
        settings: this.currentSettings
      });
    } catch (error) {
      console.error('Error applying settings:', error);
    }
  }

  autoSaveSettings() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(async () => {
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
      // Silently fail
    }
  }

  updateAudioInfo(info) {
    const updates = {
      sampleRate: info.sampleRate ? `${(info.sampleRate / 1000).toFixed(1)}k` : '-',
      channels: info.channels || '-',
      bitDepth: info.bitDepth || '-',
      codec: info.codec || '?',
      bitrate: info.bitrate || '?',
      duration: info.duration || '-'
    };

    Object.entries(updates).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  async saveCustomPreset() {
    const nameInput = document.getElementById('presetName');
    const name = nameInput.value.trim();
    if (!name) return;

    const customPresets = await chrome.storage.local.get('customPresets');
    const presets = customPresets.customPresets || {};

    presets[name] = { ...this.currentSettings };
    await chrome.storage.local.set({ customPresets: presets });

    nameInput.value = '';
    this.loadCustomPresets();
  }

  async deleteCustomPreset() {
    // Delete selected preset (TODO: add selection UI)
  }

  async loadCustomPresets() {
    const result = await chrome.storage.local.get('customPresets');
    const presets = result.customPresets || {};

    const listEl = document.getElementById('customPresetList');
    if (!listEl) return;

    listEl.innerHTML = '';
    Object.entries(presets).forEach(([name, settings]) => {
      const btn = document.createElement('button');
      btn.className = 'custom-preset-item';
      btn.textContent = name;
      btn.onclick = () => {
        Object.assign(this.currentSettings, settings);
        this.updateUI();
        this.applySettings();
      };
      listEl.appendChild(btn);
    });
  }
}

// Initialize UI
const audioLiftUI = new AudioLiftUI();

// Cleanup on unload
window.addEventListener('unload', () => {
  if (audioLiftUI.audioInfoUpdateInterval) {
    clearInterval(audioLiftUI.audioInfoUpdateInterval);
  }
  if (audioLiftUI.animationFrameId) {
    cancelAnimationFrame(audioLiftUI.animationFrameId);
  }
});
