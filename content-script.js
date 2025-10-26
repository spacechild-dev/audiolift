// AudioLift - Content Script
// Web Audio API integration for audio enhancement

class AudioLift {
  constructor() {
    this.audioContext = null;
    this.audioSources = new WeakMap(); // WeakMap for auto garbage collection
    this.processedElements = new WeakSet(); // Track processing attempts
    this.settings = {
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
    };
    this.init();
  }

  async init() {
    // Load saved settings
    await this.loadSettings();

    // Listen for settings changes
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'updateSettings') {
        console.log('AudioLift: Received updateSettings message:', message.settings);
        this.settings = { ...this.settings, ...message.settings };
        this.applySettings();
        sendResponse({ success: true });
      } else if (message.type === 'getStatus') {
        sendResponse({ enabled: this.settings.enabled });
      } else if (message.type === 'getAudioInfo') {
        const audioInfo = this.getAudioInfo();
        sendResponse({ audioInfo });
      }
      return true;
    });

    // Observe DOM for new media elements
    this.observeMediaElements();

    // Process existing media elements
    this.processExistingMediaElements();
  }

  async loadSettings() {
    const tabId = await this.getCurrentTabId();

    // Get domain for domain-specific settings
    const domain = window.location.hostname;
    const result = await chrome.storage.local.get([
      'globalSettings',
      `domainSettings_${domain}`,
      `tabSettings_${tabId}`
    ]);

    // Tab-specific settings override domain > global
    this.settings = {
      ...this.settings,
      ...result.globalSettings,
      ...result[`domainSettings_${domain}`],
      ...result[`tabSettings_${tabId}`]
    };

    // Always process media elements (will use bypass mode if disabled)
    this.processExistingMediaElements();
  }

  async getCurrentTabId() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'getTabId' }, (response) => {
        resolve(response?.tabId || 'unknown');
      });
    });
  }

  observeMediaElements() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
              this.processMediaElement(node);
            }
            // Check children
            const mediaElements = node.querySelectorAll?.('video, audio');
            mediaElements?.forEach(el => this.processMediaElement(el));
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  processExistingMediaElements() {
    const mediaElements = document.querySelectorAll('video, audio');
    console.log(`AudioLift: Found ${mediaElements.length} media elements`);
    mediaElements.forEach(el => this.processMediaElement(el));
  }

  processMediaElement(mediaElement) {
    // Skip if already attempted to process
    if (this.processedElements.has(mediaElement)) {
      return;
    }

    // Mark as attempted immediately to prevent double processing
    this.processedElements.add(mediaElement);

    console.log('AudioLift: Processing new media element', mediaElement.tagName, mediaElement.readyState);

    // Wait for the element to be ready
    const setupAudio = () => {
      // Skip if element removed from DOM
      if (!document.contains(mediaElement)) {
        console.log('AudioLift: Element no longer in DOM, skipping');
        return;
      }

      try {
        // Create audio context on first use
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          console.log('AudioLift: Created AudioContext');
        }

        console.log('AudioLift: Creating media source...');

        // Create source from media element (can only be done ONCE per element)
        const source = this.audioContext.createMediaElementSource(mediaElement);

        console.log('AudioLift: Media source created, building audio chain...');

        // Create audio processing chain
        const nodes = this.createAudioChain();

        // Connect the chain - ALWAYS connected, NEVER disconnected
        source.connect(nodes.preamp);
        nodes.preamp.connect(nodes.bassFilter);
        nodes.bassFilter.connect(nodes.midFilter);
        nodes.midFilter.connect(nodes.trebleFilter);
        nodes.trebleFilter.connect(nodes.compressor);
        nodes.compressor.connect(this.audioContext.destination);

        // Store reference using WeakMap
        this.audioSources.set(mediaElement, {
          source,
          nodes,
          mediaElement
        });

        // Apply current settings (will use bypass mode if disabled)
        this.applySettingsToNodes(nodes);

        console.log('AudioLift: ✓ Connected successfully!', 'enabled:', this.settings.enabled);

        // Resume AudioContext if suspended (autoplay policy)
        if (this.audioContext.state === 'suspended') {
          console.log('AudioLift: AudioContext suspended, will resume on user interaction');
          const resume = () => {
            this.audioContext.resume();
            console.log('AudioLift: AudioContext resumed');
          };
          document.addEventListener('click', resume, { once: true });
          document.addEventListener('keydown', resume, { once: true });
        }

      } catch (error) {
        if (error.name === 'InvalidStateError') {
          // Element already connected - this is OK, might be from another extension
          console.log('AudioLift: Element already has audio source (possibly from another extension)');
        } else if (error.name === 'NotSupportedError') {
          // CORS-restricted media
          console.warn('AudioLift: Media is CORS-restricted, cannot process');
        } else {
          console.error('AudioLift: ✗ Failed to setup audio:', error);
        }
      }
    };

    // Setup audio when media is ready or playing
    const trySetup = () => {
      if (mediaElement.readyState >= 2) {
        console.log('AudioLift: Media ready, setting up audio...');
        setupAudio();
      }
    };

    // Try immediately
    trySetup();

    // Also listen for events
    if (mediaElement.readyState < 2) {
      console.log('AudioLift: Media not ready yet, waiting for events...');
      mediaElement.addEventListener('loadedmetadata', () => {
        console.log('AudioLift: loadedmetadata event fired');
        setupAudio();
      }, { once: true });

      mediaElement.addEventListener('canplay', () => {
        console.log('AudioLift: canplay event fired');
        setupAudio();
      }, { once: true });
    }
  }

  createAudioChain() {
    const ctx = this.audioContext;

    // Preamp (gain)
    const preamp = ctx.createGain();

    // Bass (low shelf filter)
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 200;

    // Mid (peaking filter)
    const midFilter = ctx.createBiquadFilter();
    midFilter.type = 'peaking';
    midFilter.frequency.value = 1000;
    midFilter.Q.value = 1;

    // Treble (high shelf filter)
    const trebleFilter = ctx.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 4000;

    // Compressor (dynamics)
    const compressor = ctx.createDynamicsCompressor();

    return {
      preamp,
      bassFilter,
      midFilter,
      trebleFilter,
      compressor
    };
  }

  applySettings() {
    console.log('AudioLift: applySettings() called', {
      enabled: this.settings.enabled,
      settings: this.settings
    });

    // Try to process any new elements that appeared
    this.processExistingMediaElements();

    // Update all existing nodes - WeakMap doesn't have forEach, iterate through DOM
    const mediaElements = document.querySelectorAll('video, audio');
    let updatedCount = 0;

    mediaElements.forEach(element => {
      const audioData = this.audioSources.get(element);
      if (audioData && audioData.nodes) {
        this.applySettingsToNodes(audioData.nodes);
        updatedCount++;
      }
    });

    console.log(`AudioLift: Settings applied to ${updatedCount} media elements`);
  }

  applySettingsToNodes(nodes) {
    if (!this.settings.enabled) {
      // Bypass mode - no processing
      nodes.preamp.gain.value = 1;
      nodes.bassFilter.gain.value = 0;
      nodes.midFilter.gain.value = 0;
      nodes.trebleFilter.gain.value = 0;
      nodes.compressor.threshold.value = -24;
      nodes.compressor.ratio.value = 1;
      nodes.compressor.knee.value = 30;
      return;
    }

    // Preamp (convert dB to gain)
    nodes.preamp.gain.value = this.dbToGain(this.settings.preamp);

    // EQ settings (dB)
    nodes.bassFilter.gain.value = this.settings.bass;
    nodes.midFilter.gain.value = this.settings.mid;
    nodes.trebleFilter.gain.value = this.settings.treble;

    // Compressor settings
    nodes.compressor.threshold.value = this.settings.compressionThreshold;
    nodes.compressor.ratio.value = this.settings.compressionRatio;
    nodes.compressor.knee.value = this.settings.compressionKnee;
    nodes.compressor.attack.value = this.settings.compressionAttack;
    nodes.compressor.release.value = this.settings.compressionRelease;
  }

  dbToGain(db) {
    return Math.pow(10, db / 20);
  }

  getAudioInfo() {
    const info = {
      sampleRate: null,
      channels: null,
      codec: null,
      bitrate: null,
      duration: null
    };

    // Get sample rate from AudioContext
    if (this.audioContext) {
      info.sampleRate = this.audioContext.sampleRate;
    }

    // Try to get info from first media element
    const mediaElements = document.querySelectorAll('video, audio');
    if (mediaElements.length > 0) {
      const firstMedia = mediaElements[0];
      const audioData = this.audioSources.get(firstMedia);

      // Get channel count from source node
      if (audioData && audioData.source) {
        info.channels = audioData.source.channelCount === 2 ? 'Stereo' : 'Mono';
      }

      // Get duration
      if (firstMedia.duration && isFinite(firstMedia.duration)) {
        const minutes = Math.floor(firstMedia.duration / 60);
        const seconds = Math.floor(firstMedia.duration % 60);
        info.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      // Try to detect codec from source URL
      const src = firstMedia.currentSrc || firstMedia.src;
      if (src) {
        info.codec = this.detectCodec(src, firstMedia);
      }

      // Estimate bitrate (very rough)
      if (firstMedia.buffered && firstMedia.buffered.length > 0) {
        // This is a rough estimate based on network state
        if (firstMedia.networkState === 2) { // NETWORK_LOADING
          info.bitrate = 'Streaming';
        } else if (firstMedia.networkState === 3) { // NETWORK_NO_SOURCE
          info.bitrate = 'No Source';
        } else {
          info.bitrate = 'Buffered';
        }
      }
    }

    return info;
  }

  detectCodec(src, mediaElement) {
    // Try to detect from file extension
    const extension = src.split('?')[0].split('.').pop().toLowerCase();

    const codecMap = {
      'mp3': 'MP3',
      'mp4': 'AAC/MP4',
      'm4a': 'AAC',
      'aac': 'AAC',
      'ogg': 'Vorbis',
      'opus': 'Opus',
      'webm': 'Opus/Vorbis',
      'flac': 'FLAC',
      'wav': 'PCM/WAV'
    };

    if (codecMap[extension]) {
      return codecMap[extension];
    }

    // Try to detect from canPlayType
    const testFormats = [
      { type: 'audio/mp4', codec: 'AAC' },
      { type: 'audio/mpeg', codec: 'MP3' },
      { type: 'audio/ogg', codec: 'Vorbis' },
      { type: 'audio/webm; codecs="opus"', codec: 'Opus' },
      { type: 'audio/flac', codec: 'FLAC' }
    ];

    for (const format of testFormats) {
      const support = mediaElement.canPlayType(format.type);
      if (support === 'probably' || support === 'maybe') {
        return format.codec;
      }
    }

    return 'Unknown';
  }
}

// Initialize AudioLift
const audioLift = new AudioLift();
