// AudioLift - Content Script
// Web Audio API integration for audio enhancement

// Cleanup previous instance if it exists (for future updates)
if (window.audioLiftInstance && typeof window.audioLiftInstance.cleanup === 'function') {
  try {
    window.audioLiftInstance.cleanup();
  } catch (e) {
    console.log('Error cleaning up previous AudioLift instance:', e);
  }
}

// Guard against double injection
if (window.audioLiftInjected) {
  // Already injected, do nothing
} else {
  window.audioLiftInjected = true;

  class AudioLift {
    constructor() {
      this.audioContext = null;
      this.audioSources = new Map(); // Map allows iteration (WeakMap does not)
      this.processedElements = new WeakSet(); // Track processing attempts
      this.observer = null;
      this.settings = {
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
        compressionAttack: 0.003,
        compressionRelease: 0.25,
        smartVolume: false,
        mono: false,
        loudnessMode: false
      };
      this.init();
    }

    cleanup() {
      // Disconnect observer
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
      
      // Close AudioContext
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }

      // Clear flags
      window.audioLiftInjected = false;
    }

    init() {
      // Wait for DOM if needed
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.start());
      } else {
        this.start();
      }
    }

    start() {
      if (!chrome.runtime?.id) {
        console.warn('AudioLift: Script started but extension context is invalid.');
        return;
      }

      console.log('AudioLift: Content script started on', window.location.hostname);
      
      // Load settings from storage
      this.loadSettings();

      // Listen for messages from popup
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'updateSettings') {
          // Debug logs
          console.log('AudioLift: Received settings update:', message.settings);
          this.settings = { ...this.settings, ...message.settings };
          console.log('AudioLift: New effective settings:', this.settings);
          this.updateAllSources();
          sendResponse({ success: true });
        } else if (message.type === 'getAudioInfo') {
          sendResponse({ audioInfo: this.getAudioInfo() });
        } else if (message.type === 'getStatus') {
          sendResponse({ enabled: this.settings.enabled });
        }
        return true;
      });

      // Process existing media elements
      this.scanForMedia();

      // Watch for new media elements
      this.observeDOM();
    }

    async loadSettings() {
      // Check if extension context is valid
      if (!chrome.runtime?.id) {
        console.warn('AudioLift: Extension context invalidated.');
        return;
      }

      try {
        // Get domain from current page
        const domain = window.location.hostname;

        const result = await chrome.storage.local.get([
          'globalSettings',
          `domainSettings_${domain}`
        ]);

        this.settings = {
          ...this.settings,
          ...result.globalSettings,
          ...result[`domainSettings_${domain}`]
        };

        // If enabled, process media
        if (this.settings.enabled) {
          this.scanForMedia();
        }
      } catch (error) {
        console.warn('AudioLift: Error loading settings:', error);
      }
    }

    scanForMedia() {
      const mediaElements = document.querySelectorAll('video, audio');
      mediaElements.forEach(el => this.processMediaElement(el));
    }

    observeDOM() {
      if (!document.body) return; // Should be safe now, but extra check doesn't hurt

      this.observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // ELEMENT_NODE
              if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
                this.processMediaElement(node);
              }
              // Check children too
              const mediaInChildren = node.querySelectorAll?.('video, audio');
              mediaInChildren?.forEach(el => this.processMediaElement(el));
            }
          });
        });
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    createAudioChain() {
      const ctx = this.audioContext;

      // Preamp (gain)
      const preamp = ctx.createGain();

      // Mono Merger (Channel Splitter/Merger)
      const monoNode = ctx.createGain();

      // 10-Band EQ
      const eq32 = ctx.createBiquadFilter();
      eq32.type = 'lowshelf'; eq32.frequency.value = 32; eq32.Q.value = 1.0;

      const eq64 = ctx.createBiquadFilter();
      eq64.type = 'peaking'; eq64.frequency.value = 64; eq64.Q.value = 1.0;

      const eq125 = ctx.createBiquadFilter();
      eq125.type = 'peaking'; eq125.frequency.value = 125; eq125.Q.value = 1.0;

      const eq250 = ctx.createBiquadFilter();
      eq250.type = 'peaking'; eq250.frequency.value = 250; eq250.Q.value = 1.0;

      const eq500 = ctx.createBiquadFilter();
      eq500.type = 'peaking'; eq500.frequency.value = 500; eq500.Q.value = 1.0;

      const eq1k = ctx.createBiquadFilter();
      eq1k.type = 'peaking'; eq1k.frequency.value = 1000; eq1k.Q.value = 1.0;

      const eq2k = ctx.createBiquadFilter();
      eq2k.type = 'peaking'; eq2k.frequency.value = 2000; eq2k.Q.value = 1.0;

      const eq4k = ctx.createBiquadFilter();
      eq4k.type = 'peaking'; eq4k.frequency.value = 4000; eq4k.Q.value = 1.0;

      const eq8k = ctx.createBiquadFilter();
      eq8k.type = 'peaking'; eq8k.frequency.value = 8000; eq8k.Q.value = 1.0;

      const eq16k = ctx.createBiquadFilter();
      eq16k.type = 'highshelf'; eq16k.frequency.value = 16000; eq16k.Q.value = 1.0;

      // Compressor (dynamics)
      const compressor = ctx.createDynamicsCompressor();

      return {
        preamp,
        monoNode,
        eq32, eq64, eq125, eq250, eq500, eq1k, eq2k, eq4k, eq8k, eq16k,
        compressor
      };
    }

    processMediaElement(mediaElement) {
      // Guards
      if (!mediaElement) return;
      if (this.audioSources.has(mediaElement)) return;
      if (this.processedElements.has(mediaElement)) return;
      this.processedElements.add(mediaElement);

      console.log('AudioLift: Found new media element', mediaElement);

      const setupAudio = () => {
        if (!document.contains(mediaElement)) return;

        try {
          console.log('AudioLift: Setting up audio graph for', mediaElement);
          if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          }

          let source;
          try {
            source = this.audioContext.createMediaElementSource(mediaElement);
          } catch (e) {
            // Check if it's the "already connected" error
            if (e.name === 'InvalidStateError') {
              console.warn('AudioLift: Element already connected to an audio graph. Cannot re-attach.', mediaElement);
              // We can't do anything about this node, it belongs to another context (probably previous extension instance)
              return; 
            }
            throw e;
          }

          const nodes = this.createAudioChain();

          // Connect Chain:
          // Source -> MonoNode -> Preamp -> EQ -> Compressor -> Destination

          source.connect(nodes.monoNode);
          nodes.monoNode.connect(nodes.preamp);
          nodes.preamp.connect(nodes.eq32);
          nodes.eq32.connect(nodes.eq64);
          nodes.eq64.connect(nodes.eq125);
          nodes.eq125.connect(nodes.eq250);
          nodes.eq250.connect(nodes.eq500);
          nodes.eq500.connect(nodes.eq1k);
          nodes.eq1k.connect(nodes.eq2k);
          nodes.eq2k.connect(nodes.eq4k);
          nodes.eq4k.connect(nodes.eq8k);
          nodes.eq8k.connect(nodes.eq16k);
          nodes.eq16k.connect(nodes.compressor);
          nodes.compressor.connect(this.audioContext.destination);

          this.audioSources.set(mediaElement, { source, nodes, mediaElement });
          this.applySettingsToNodes(nodes);

          // Auto-resume context
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
          }

        } catch (error) {
          console.warn('AudioLift connection error:', error);
        }
      };

      // Trigger setup
      if (mediaElement.readyState >= 2) {
        setupAudio();
      } else {
        mediaElement.addEventListener('loadedmetadata', setupAudio, { once: true });
      }
    }

    applySettingsToNodes(nodes) {
      console.log('AudioLift: Applying settings. Enabled:', this.settings.enabled);
      if (!this.settings.enabled) {
        // Bypass settings
        nodes.monoNode.channelCount = 2; // Default stereo
        nodes.monoNode.channelCountMode = 'max';
        nodes.preamp.gain.value = 1;
        // Reset EQs to 0
        [nodes.eq32, nodes.eq64, nodes.eq125, nodes.eq250, nodes.eq500,
         nodes.eq1k, nodes.eq2k, nodes.eq4k, nodes.eq8k, nodes.eq16k].forEach(n => n.gain.value = 0);
        // Reset Compressor
        nodes.compressor.threshold.value = -24;
        nodes.compressor.ratio.value = 1;
        return;
      }

      // 1. Mono Mode
      if (this.settings.mono) {
        // Force mixing to mono (1 channel) then upmix to speakers
        nodes.monoNode.channelCount = 1;
        nodes.monoNode.channelCountMode = 'explicit';
      } else {
        nodes.monoNode.channelCount = 2;
        nodes.monoNode.channelCountMode = 'max';
      }

      // 2. Preamp
      let finalPreamp = this.settings.preamp;
      if (this.settings.smartVolume) {
        finalPreamp += 4; // +4dB auto boost for normalization feel
      } else if (this.settings.loudnessMode) {
        finalPreamp += 3; // Slight boost for loudness mode
      }
      nodes.preamp.gain.value = this.dbToGain(finalPreamp);

      // 3. EQ & Loudness Mode
      if (this.settings.loudnessMode) {
        // Apply a fixed loudness EQ curve
        nodes.eq32.gain.value = 6;
        nodes.eq64.gain.value = 4;
        nodes.eq125.gain.value = 2;
        nodes.eq250.gain.value = 0;
        nodes.eq500.gain.value = -1;
        nodes.eq1k.gain.value = 0;
        nodes.eq2k.gain.value = 2;
        nodes.eq4k.gain.value = 4;
        nodes.eq8k.gain.value = 5;
        nodes.eq16k.gain.value = 6;
      } else {
        // Apply manual EQ settings
        nodes.eq32.gain.value = this.settings.eq32;
        nodes.eq64.gain.value = this.settings.eq64;
        nodes.eq125.gain.value = this.settings.eq125;
        nodes.eq250.gain.value = this.settings.eq250;
        nodes.eq500.gain.value = this.settings.eq500;
        nodes.eq1k.gain.value = this.settings.eq1k;
        nodes.eq2k.gain.value = this.settings.eq2k;
        nodes.eq4k.gain.value = this.settings.eq4k;
        nodes.eq8k.gain.value = this.settings.eq8k;
        nodes.eq16k.gain.value = this.settings.eq16k;
      }

      // 4. Smart Volume (Compressor Override) vs Manual
      if (this.settings.smartVolume) {
        // Aggressive "TV Normalization" settings
        nodes.compressor.threshold.value = -35; // Catch quiet sounds
        nodes.compressor.ratio.value = 8;       // Squash loud sounds strongly
        nodes.compressor.knee.value = 10;       // Harder knee
        nodes.compressor.attack.value = 0.05;   // Slightly slower attack to keep some punch
        nodes.compressor.release.value = 0.25;
      } else {
        // Manual settings
        nodes.compressor.threshold.value = this.settings.compressionThreshold;
        nodes.compressor.ratio.value = this.settings.compressionRatio;
        nodes.compressor.knee.value = this.settings.compressionKnee;
        nodes.compressor.attack.value = this.settings.compressionAttack;
        nodes.compressor.release.value = this.settings.compressionRelease;
      }
    }

    updateAllSources() {
      // Update settings for all active media elements
      for (const [mediaElement, data] of this.audioSources.entries()) {
        // Garbage collection: Remove if element is no longer in DOM
        if (!mediaElement.isConnected) {
          this.audioSources.delete(mediaElement);
          continue;
        }

        if (data && data.nodes) {
          this.applySettingsToNodes(data.nodes);
        }
      }

      // Resume audio context if needed
      if (this.audioContext && this.audioContext.state === 'suspended' && this.settings.enabled) {
        this.audioContext.resume();
      }
    }

    dbToGain(db) {
      return Math.pow(10, db / 20);
    }

    getAudioInfo() {
      const info = {
        sampleRate: null,
        channels: null,
        bitDepth: null,
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
          // Estimate bit depth from codec
          info.bitDepth = this.estimateBitDepth(info.codec);
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

    estimateBitDepth(codec) {
      // We can't actually detect bit depth from Web Audio API
      // But we can make educated guesses based on codec

      const highQualityCodecs = ['FLAC', 'PCM/WAV'];
      const mediumQualityCodecs = ['AAC', 'Opus'];
      const lowerQualityCodecs = ['MP3', 'Vorbis'];

      if (highQualityCodecs.includes(codec)) {
        return '24-bit';
      } else if (mediumQualityCodecs.includes(codec)) {
        return '16-bit';
      } else if (lowerQualityCodecs.includes(codec)) {
        return '16-bit';
      }

      // For streaming services, assume 16-bit
      return '16-bit';
    }
  }

  // Initialize AudioLift
  window.audioLiftInstance = new AudioLift();
}
