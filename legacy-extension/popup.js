// AudioLift - Popup UI Logic (v2.2.0 - 10-Band EQ + Spectrum)

class AudioLiftUI {
  constructor() {
    this.tabId = null;
    this.currentPreset = null; // Track active preset per domain
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
      compressionKnee: 30,
      smartVolume: false,
      mono: false,
      loudnessMode: false
    };

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
    // Initialize theme system (hybrid: system + chrome + manual)
    await this.initTheme();

    // Detect popup vs side panel mode
    this.detectMode();

    // Get current tab
    await this.updateCurrentTab();

    // Setup event listeners
    this.setupEventListeners();

    // Listen for tab changes (important for side panel mode)
    this.setupTabListener();

    // Load settings
    await this.loadSettings();

    // Update UI
    this.updateUI();

    // Give content script a moment to initialize before applying settings
    setTimeout(() => {
        this.applySettings();
    }, 100);

    // Request audio info
    this.requestAudioInfo();

    // Update audio info periodically
    this.audioInfoUpdateInterval = setInterval(() => {
      this.requestAudioInfo();
    }, 2000);
  }

  detectMode() {
    // Simple detection: side panel is usually wider
    const isWide = window.innerWidth > 380;
    document.body.classList.add(isWide ? 'sidepanel-mode' : 'popup-mode');
  }

  async updateCurrentTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      this.tabId = tabs[0].id;

      // Get domain
      try {
        const url = new URL(tabs[0].url);
        this.domain = url.hostname;
      } catch (e) {
        this.domain = 'unknown';
      }
    }
  }

  setupTabListener() {
    // Listen for tab activation changes (important for side panel mode)
    chrome.tabs.onActivated.addListener(async (activeInfo) => {
      // Update to new active tab
      const oldTabId = this.tabId;
      this.tabId = activeInfo.tabId;

      // Get new domain
      try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        const url = new URL(tab.url);
        this.domain = url.hostname;
      } catch (e) {
        this.domain = 'unknown';
      }

      // Only reload if tab actually changed
      if (oldTabId !== this.tabId) {
        console.log('AudioLift: Tab changed from', oldTabId, 'to', this.tabId);

        // Reload settings for new tab/domain
        await this.loadSettings();

        // Update UI
        this.updateUI();

        // Request audio info for new tab
        this.requestAudioInfo();
      }
    });

    // Also listen for tab updates (URL changes within same tab)
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      // Only care about the current tab
      if (tabId === this.tabId && changeInfo.url) {
        console.log('AudioLift: Tab URL changed to', changeInfo.url);

        // Update domain
        try {
          const url = new URL(changeInfo.url);
          this.domain = url.hostname;
        } catch (e) {
          this.domain = 'unknown';
        }

        // Reload settings for new domain
        await this.loadSettings();

        // Update UI
        this.updateUI();

        // Request audio info
        this.requestAudioInfo();
      }
    });
  }

  setupEventListeners() {
    // Master toggle
    document.getElementById('masterToggle').addEventListener('change', (e) => {
      this.currentSettings.enabled = e.target.checked;
      this.updateControlsState();
      this.applySettings();
      this.autoSaveSettings();
    });

    // Smart Volume Toggle
    const smartVolumeBtn = document.getElementById('smartVolumeBtn');
    if (smartVolumeBtn) {
      smartVolumeBtn.addEventListener('click', () => {
        this.currentSettings.smartVolume = !this.currentSettings.smartVolume;
        this.applySettings();
        this.autoSaveSettings();
        this.updateUI();
      });
    }

    // Mono Toggle
    const monoBtn = document.getElementById('monoBtn');
    if (monoBtn) {
      monoBtn.addEventListener('click', () => {
        this.currentSettings.mono = !this.currentSettings.mono;
        this.applySettings();
        this.autoSaveSettings();
        this.updateUI();
      });
    }

    // Loudness Toggle
    const loudnessBtn = document.getElementById('loudnessBtn');
    if (loudnessBtn) {
      loudnessBtn.addEventListener('click', () => {
        this.currentSettings.loudnessMode = !this.currentSettings.loudnessMode;
        // If loudness is on, turn off smart volume for logical consistency
        if (this.currentSettings.loudnessMode) {
            this.currentSettings.smartVolume = false;
        }
        this.applySettings();
        this.autoSaveSettings();
        this.updateUI();
      });
    }

    // Theme toggle button
    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Chrome theme checkbox
    const useChromeThemeCheckbox = document.getElementById('useChromeTheme');
    if (useChromeThemeCheckbox) {
      useChromeThemeCheckbox.addEventListener('change', async (e) => {
        await this.toggleChromeTheme(e.target.checked);
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

    // Reload button
    const reloadBtn = document.getElementById('reloadBtn');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => {
        chrome.tabs.reload(this.tabId);
        window.close(); // Close popup
      });
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

    // Save active preset for this domain
    this.currentPreset = presetName;
    chrome.storage.local.set({
      [`domainPreset_${this.domain}`]: presetName
    });

    this.updateUI();

    this.applySettings();
    this.autoSaveSettings();
  }

  highlightActivePreset() {
    // Clear all active states
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Highlight current preset
    if (this.currentPreset) {
      const activeBtn = document.querySelector(`[data-preset="${this.currentPreset}"]`);
      if (activeBtn) {
        activeBtn.classList.add('active');
      }
    }
  }

  async loadSettings() {
    const result = await chrome.storage.local.get([
      'globalSettings',
      `domainSettings_${this.domain}`,
      `domainPreset_${this.domain}`
    ]);

    this.currentSettings = {
      ...this.currentSettings,
      ...result.globalSettings,
      ...result[`domainSettings_${this.domain}`]
    };

    // Load active preset for this domain
    this.currentPreset = result[`domainPreset_${this.domain}`] || null;
  }

  updateUI() {
    document.getElementById('masterToggle').checked = this.currentSettings.enabled;
    this.updateControlsState();

    // Update Quick Tools Buttons
    const smartVolumeBtn = document.getElementById('smartVolumeBtn');
    const monoBtn = document.getElementById('monoBtn');
    const loudnessBtn = document.getElementById('loudnessBtn');
    
    if (smartVolumeBtn) {
        if (this.currentSettings.smartVolume) smartVolumeBtn.classList.add('active');
        else smartVolumeBtn.classList.remove('active');
    }
    
    if (monoBtn) {
        if (this.currentSettings.mono) monoBtn.classList.add('active');
        else monoBtn.classList.remove('active');
    }

    if (loudnessBtn) {
        if (this.currentSettings.loudnessMode) loudnessBtn.classList.add('active');
        else loudnessBtn.classList.remove('active');
    }

    // Disable compression controls if Smart Volume is active
    const compressionControls = document.querySelector('.compression-controls');
    if (compressionControls) {
        if (this.currentSettings.smartVolume) compressionControls.classList.add('disabled');
        else compressionControls.classList.remove('disabled');
    }

    // Disable EQ sliders if Loudness mode is active
    const eqSliders = document.querySelectorAll('.eq-band input[type="range"]');
    const preampSlider = document.getElementById('preamp');
    
    if (this.currentSettings.loudnessMode) {
        eqSliders.forEach(slider => slider.classList.add('disabled'));
        if (preampSlider) preampSlider.classList.add('disabled');
    } else {
        eqSliders.forEach(slider => slider.classList.remove('disabled'));
        if (preampSlider) preampSlider.classList.remove('disabled');
    }

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

    // Highlight active preset
    this.highlightActivePreset();
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
    if (!this.tabId) return;
    
    try {
      chrome.tabs.sendMessage(this.tabId, {
        type: 'updateSettings',
        settings: this.currentSettings
      }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not ready or page restricted
          console.log('AudioLift: Could not update settings on tab', this.tabId, chrome.runtime.lastError.message);
        }
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
        // If successful, ensure warning is hidden
        document.getElementById('reloadWarning')?.classList.add('hidden');
      }
    } catch (error) {
      // Content script likely not loaded, show reload warning
      // Only show if we are on a valid http/https page
      if (this.domain && this.domain !== 'unknown' && !this.domain.startsWith('chrome')) {
        document.getElementById('reloadWarning')?.classList.remove('hidden');
      }
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
    const nameInput = document.getElementById('presetName');
    const name = nameInput.value.trim();
    if (!name) return;

    const result = await chrome.storage.local.get('customPresets');
    const presets = result.customPresets || {};

    if (presets[name]) {
      delete presets[name];
      await chrome.storage.local.set({ customPresets: presets });
      nameInput.value = '';
      this.loadCustomPresets();
    }
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
        // Populate input for easy update/delete
        const nameInput = document.getElementById('presetName');
        if (nameInput) nameInput.value = name;

        this.updateUI();
        this.applySettings();
      };
      listEl.appendChild(btn);
    });
  }

  // ========== Theme System (Hybrid: System + Chrome + Manual) ==========

  async initTheme() {
    // Load saved theme preference
    const result = await chrome.storage.local.get(['themePreference', 'useChromeTheme']);
    const savedTheme = result.themePreference; // 'light', 'dark', or 'auto' (undefined = auto)
    const useChromeTheme = result.useChromeTheme || false;

    // Update checkbox state
    const checkbox = document.getElementById('useChromeTheme');
    if (checkbox) {
      checkbox.checked = useChromeTheme;
    }

    // Apply Chrome theme if enabled
    if (useChromeTheme) {
      await this.applyChromeTheme();
    }

    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
      this.updateThemeButton('light');
    } else if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      this.updateThemeButton('dark');
    } else {
      // Auto mode: try Chrome theme API first, then system preference
      await this.detectAutoTheme();
      this.updateThemeButton('auto');
    }
  }

  async detectAutoTheme() {
    // Try to detect Chrome's theme (if API available)
    try {
      // Chrome doesn't have a direct theme API, but we can check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if (prefersDark) {
        // System is dark, but don't add class (let CSS @media handle it)
        // Or add class to override
        // For now, let CSS media query handle it naturally
      }
    } catch (e) {
      console.log('Theme detection not available:', e);
    }
  }

  async toggleTheme() {
    // Cycle through: auto → light → dark → auto
    const currentTheme = this.getCurrentTheme();

    let nextTheme;
    if (currentTheme === 'auto' || !currentTheme) {
      nextTheme = 'light';
    } else if (currentTheme === 'light') {
      nextTheme = 'dark';
    } else {
      nextTheme = 'auto';
    }

    // Remove all theme classes
    document.body.classList.remove('light-mode', 'dark-mode');

    // Apply new theme
    if (nextTheme === 'light') {
      document.body.classList.add('light-mode');
    } else if (nextTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }
    // 'auto' = no class, let CSS @media handle it

    // Save preference
    await chrome.storage.local.set({ themePreference: nextTheme });

    // Update button icon
    this.updateThemeButton(nextTheme);
  }

  getCurrentTheme() {
    if (document.body.classList.contains('light-mode')) return 'light';
    if (document.body.classList.contains('dark-mode')) return 'dark';
    return 'auto';
  }

  updateThemeButton(theme) {
    const themeBtn = document.getElementById('themeBtn');
    if (!themeBtn) return;

    // Update button icon based on theme
    const icons = {
      light: '☀️',   // Sun for light mode
      dark: '🌙',    // Moon for dark mode
      auto: '🌓'     // Half moon for auto mode
    };

    themeBtn.textContent = icons[theme] || icons.auto;
    themeBtn.title = `Theme: ${theme === 'auto' ? 'Auto (System)' : theme === 'light' ? 'Light' : 'Dark'} - Click to cycle`;
  }

  async toggleChromeTheme(enabled) {
    // Save preference
    await chrome.storage.local.set({ useChromeTheme: enabled });

    if (enabled) {
      await this.applyChromeTheme();
    } else {
      // Reset to default colors (remove inline styles)
      document.documentElement.style.removeProperty('--bg-primary');
      document.documentElement.style.removeProperty('--bg-secondary');
      document.documentElement.style.removeProperty('--bg-tertiary');
    }
  }

  async applyChromeTheme() {
    try {
      // Get Chrome's current theme
      const theme = await chrome.theme.getCurrent();

      if (theme && theme.colors) {
        // Chrome theme colors are available
        console.log('Chrome theme:', theme);

        // Map Chrome theme colors to our CSS variables
        if (theme.colors.frame) {
          // 'frame' is the toolbar/chrome background color
          const frameColor = this.rgbArrayToHex(theme.colors.frame);
          document.documentElement.style.setProperty('--bg-tertiary', frameColor);
        }

        if (theme.colors.toolbar) {
          // 'toolbar' is usually lighter
          const toolbarColor = this.rgbArrayToHex(theme.colors.toolbar);
          document.documentElement.style.setProperty('--bg-primary', toolbarColor);
          document.documentElement.style.setProperty('--bg-secondary', toolbarColor);
        }

        // If no toolbar color but has frame, derive lighter version
        if (!theme.colors.toolbar && theme.colors.frame) {
          const frameColor = this.rgbArrayToHex(theme.colors.frame);
          document.documentElement.style.setProperty('--bg-primary', frameColor);
          document.documentElement.style.setProperty('--bg-secondary', frameColor);
        }
      }
    } catch (error) {
      console.log('Chrome theme API not available or no custom theme:', error);
    }
  }

  rgbArrayToHex(rgb) {
    // Convert [r, g, b] array to hex color
    if (!rgb || rgb.length < 3) return null;
    const r = rgb[0].toString(16).padStart(2, '0');
    const g = rgb[1].toString(16).padStart(2, '0');
    const b = rgb[2].toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
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
