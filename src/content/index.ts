import { AudioLiftSettings, defaultSettings, AudioInfo } from '../types';

interface AudioLiftInstance {
  cleanup: () => void;
}

declare global {
  interface Window {
    audioLiftInstance?: AudioLiftInstance;
    audioLiftInjected?: boolean;
    webkitAudioContext: typeof AudioContext;
  }
}

// Cleanup previous instance if it exists
if (window.audioLiftInstance && typeof window.audioLiftInstance.cleanup === 'function') {
  try {
    window.audioLiftInstance.cleanup();
  } catch (e) {
    console.log('Error cleaning up previous AudioLift instance:', e);
  }
}

interface AudioSourceData {
  source: MediaElementAudioSourceNode;
  nodes: AudioChain;
  mediaElement: HTMLMediaElement;
}

interface AudioChain {
  preamp: GainNode;
  monoNode: GainNode;
  eq32: BiquadFilterNode;
  eq64: BiquadFilterNode;
  eq125: BiquadFilterNode;
  eq250: BiquadFilterNode;
  eq500: BiquadFilterNode;
  eq1k: BiquadFilterNode;
  eq2k: BiquadFilterNode;
  eq4k: BiquadFilterNode;
  eq8k: BiquadFilterNode;
  eq16k: BiquadFilterNode;
  compressor: DynamicsCompressorNode;
}

class AudioLift implements AudioLiftInstance {
  audioContext: AudioContext | null = null;
  audioSources: Map<HTMLMediaElement, AudioSourceData> = new Map();
  processedElements: WeakSet<HTMLMediaElement> = new WeakSet();
  observer: MutationObserver | null = null;
  settings: AudioLiftSettings = { ...defaultSettings };

  constructor() {
    this.init();
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    window.audioLiftInjected = false;
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    if (!chrome.runtime?.id) {
      console.warn('AudioLift: Content script started but extension context is invalid.');
      return;
    }

    console.log('AudioLift: Content script started on', window.location.hostname);
    
    this.loadSettings();

    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'updateSettings') {
        console.log('AudioLift: Received settings update:', message.settings);
        this.settings = { ...this.settings, ...message.settings };
        this.updateAllSources();
        sendResponse({ success: true });
      } else if (message.type === 'getAudioInfo') {
        sendResponse({ audioInfo: this.getAudioInfo() });
      } else if (message.type === 'getStatus') {
        sendResponse({ enabled: this.settings.enabled });
      }
      return true;
    });

    this.scanForMedia();
    this.observeDOM();
  }

  async loadSettings() {
    if (!chrome.runtime?.id) {
      console.warn('AudioLift: Extension context invalidated.');
      return;
    }

    try {
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

      if (this.settings.enabled) {
        this.scanForMedia();
      }
    } catch (error) {
      console.warn('AudioLift: Error loading settings:', error);
    }
  }

  scanForMedia() {
    const mediaElements = document.querySelectorAll<HTMLMediaElement>('video, audio');
    mediaElements.forEach(el => this.processMediaElement(el));
  }

  observeDOM() {
    if (!document.body) return;

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // ELEMENT_NODE
            const element = node as HTMLElement;
            if (element.tagName === 'VIDEO' || element.tagName === 'AUDIO') {
              this.processMediaElement(element as HTMLMediaElement);
            }
            const mediaInChildren = element.querySelectorAll?.('video, audio');
            mediaInChildren?.forEach((el) => this.processMediaElement(el as HTMLMediaElement));
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  createAudioChain(): AudioChain {
    if (!this.audioContext) throw new Error("AudioContext not initialized");
    const ctx = this.audioContext;

    const preamp = ctx.createGain();
    const monoNode = ctx.createGain();

    // Helper for filters
    const createFilter = (type: BiquadFilterType, freq: number) => {
      const filter = ctx.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = freq;
      filter.Q.value = 1.0;
      return filter;
    };

    const eq32 = createFilter('lowshelf', 32);
    const eq64 = createFilter('peaking', 64);
    const eq125 = createFilter('peaking', 125);
    const eq250 = createFilter('peaking', 250);
    const eq500 = createFilter('peaking', 500);
    const eq1k = createFilter('peaking', 1000);
    const eq2k = createFilter('peaking', 2000);
    const eq4k = createFilter('peaking', 4000);
    const eq8k = createFilter('peaking', 8000);
    const eq16k = createFilter('highshelf', 16000);

    const compressor = ctx.createDynamicsCompressor();

    return {
      preamp, monoNode,
      eq32, eq64, eq125, eq250, eq500, eq1k, eq2k, eq4k, eq8k, eq16k,
      compressor
    };
  }

  processMediaElement(mediaElement: HTMLMediaElement) {
    if (!mediaElement) return;
    if (this.audioSources.has(mediaElement)) return;
    if (this.processedElements.has(mediaElement)) return;
    this.processedElements.add(mediaElement);

    console.log('AudioLift: Found new media element', mediaElement);

    const setupAudio = () => {
      if (!document.contains(mediaElement)) return;

      // CORS Fix: Required for Web Audio API to work with cross-origin sources (e.g., YouTube)
      // Without this, the AudioContext may output silence (tainted).
      if (!mediaElement.crossOrigin && mediaElement.src && !mediaElement.src.startsWith('blob:') && !mediaElement.src.startsWith('data:')) {
        // We only set this for actual URLs. blobs often fail if modified.
        // WARNING: This forces a reload of the media element.
        try {
          const wasPaused = mediaElement.paused;
          // const currentTime = mediaElement.currentTime; // Unused
          mediaElement.crossOrigin = "anonymous";
          // We might need to reload, but usually setting the attribute is enough to trigger a fetch check on next play
          // However, for already playing media, we might need to force a quick reload if it stops.
          if (!wasPaused) {
             // Some browsers require a re-load call
             // mediaElement.load(); // This is too disruptive, let's try just setting it.
          }
        } catch (e) {
          console.warn('AudioLift: Failed to set crossOrigin', e);
        }
      }

      try {
        console.log('AudioLift: Setting up audio graph for', mediaElement);
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        let source: MediaElementAudioSourceNode;
        try {
          source = this.audioContext.createMediaElementSource(mediaElement);
        } catch (e: any) {
          if (e.name === 'InvalidStateError') {
            console.warn('AudioLift: Element already connected. Skipping.');
            // Even if connected, we might have lost our reference.
            // But we can't reconnect it.
            return; 
          }
          throw e;
        }

        const nodes = this.createAudioChain();

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

        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }

      } catch (error) {
        console.warn('AudioLift connection error:', error);
      }
    };

    if (mediaElement.readyState >= 2) {
      setupAudio();
    } else {
      mediaElement.addEventListener('loadedmetadata', setupAudio, { once: true });
    }
  }

  applySettingsToNodes(nodes: AudioChain) {
    if (!this.settings.enabled) {
      nodes.monoNode.channelCount = 2;
      nodes.monoNode.channelCountMode = 'max';
      nodes.preamp.gain.value = 1;
      
      const filters = [nodes.eq32, nodes.eq64, nodes.eq125, nodes.eq250, nodes.eq500,
       nodes.eq1k, nodes.eq2k, nodes.eq4k, nodes.eq8k, nodes.eq16k];
      filters.forEach(n => n.gain.value = 0);
      
      nodes.compressor.threshold.value = -24;
      nodes.compressor.ratio.value = 1;
      return;
    }

    // Mono
    if (this.settings.mono) {
      nodes.monoNode.channelCount = 1;
      nodes.monoNode.channelCountMode = 'explicit';
    } else {
      nodes.monoNode.channelCount = 2;
      nodes.monoNode.channelCountMode = 'max';
    }

    // Preamp
    let finalPreamp = this.settings.preamp;
    if (this.settings.smartVolume) {
      finalPreamp += 4;
    } else if (this.settings.loudnessMode) {
      finalPreamp += 3;
    }
    nodes.preamp.gain.value = this.dbToGain(finalPreamp);

    // EQ
    if (this.settings.loudnessMode) {
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

    // Compressor
    if (this.settings.smartVolume) {
      nodes.compressor.threshold.value = -35;
      nodes.compressor.ratio.value = 8;
      nodes.compressor.knee.value = 10;
      nodes.compressor.attack.value = 0.05;
      nodes.compressor.release.value = 0.25;
    } else {
      nodes.compressor.threshold.value = this.settings.compressionThreshold;
      nodes.compressor.ratio.value = this.settings.compressionRatio;
      nodes.compressor.knee.value = this.settings.compressionKnee;
      nodes.compressor.attack.value = this.settings.compressionAttack;
      nodes.compressor.release.value = this.settings.compressionRelease;
    }
  }

  updateAllSources() {
    for (const [mediaElement, data] of this.audioSources.entries()) {
      if (!mediaElement.isConnected) {
        this.audioSources.delete(mediaElement);
        continue;
      }
      if (data && data.nodes) {
        this.applySettingsToNodes(data.nodes);
      }
    }

    if (this.audioContext && this.audioContext.state === 'suspended' && this.settings.enabled) {
      this.audioContext.resume();
    }
  }

  dbToGain(db: number) {
    return Math.pow(10, db / 20);
  }

  getAudioInfo(): AudioInfo {
    const info: AudioInfo = {
      sampleRate: null,
      channels: null,
      bitDepth: null,
      codec: null,
      bitrate: null,
      duration: null
    };

    if (this.audioContext) {
      info.sampleRate = this.audioContext.sampleRate;
    }

    const mediaElements = document.querySelectorAll('video, audio');
    if (mediaElements.length > 0) {
      const firstMedia = mediaElements[0] as HTMLMediaElement;
      const audioData = this.audioSources.get(firstMedia);

      if (audioData && audioData.source) {
        info.channels = audioData.source.channelCount === 2 ? 'Stereo' : 'Mono';
      }

      if (firstMedia.duration && isFinite(firstMedia.duration)) {
        const minutes = Math.floor(firstMedia.duration / 60);
        const seconds = Math.floor(firstMedia.duration % 60);
        info.duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      const src = firstMedia.currentSrc || firstMedia.src;
      if (src) {
        info.codec = this.detectCodec(src, firstMedia);
        info.bitDepth = this.estimateBitDepth(info.codec);
      }

      if (firstMedia.buffered && firstMedia.buffered.length > 0) {
        if (firstMedia.networkState === 2) {
          info.bitrate = 'Streaming';
        } else if (firstMedia.networkState === 3) {
          info.bitrate = 'No Source';
        } else {
          info.bitrate = 'Buffered';
        }
      }
    }

    return info;
  }

  detectCodec(src: string, mediaElement: HTMLMediaElement) {
    const extension = src.split('?')[0].split('.').pop()?.toLowerCase() || '';

    const codecMap: Record<string, string> = {
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

  estimateBitDepth(codec: string | null) {
    if (!codec) return '-';
    const highQualityCodecs = ['FLAC', 'PCM/WAV'];
    if (highQualityCodecs.includes(codec)) return '24-bit';
    return '16-bit';
  }
}

if (!window.audioLiftInjected) {
  window.audioLiftInjected = true;
  window.audioLiftInstance = new AudioLift();
}
