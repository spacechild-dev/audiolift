# AudioLift

> Boost and enhance audio for any browser tab with EQ, dynamic range compression, and dialogue enhancement.

AudioLift is a Chrome extension that provides professional-grade audio enhancement for your browser tabs. Perfect for watching movies with low audio, boosting dialogue clarity, or customizing your audio experience.

## Features

### Audio Enhancement
- **3-Band Equalizer**: Adjust Bass, Mid, and Treble independently (±12dB)
- **Preamp/Gain**: Boost overall volume up to +10dB
- **Dynamic Range Compression**: Reduce the difference between quiet and loud sounds
  - Adjustable threshold, ratio, and knee
  - Perfect for movies with quiet dialogue and loud action scenes
- **Real-time Processing**: Zero latency audio enhancement using Web Audio API
- **Audio Information Display**: Real-time metadata panel showing:
  - Sample rate (e.g., 48000 Hz)
  - Channel configuration (Mono/Stereo)
  - Codec (MP3, AAC, Opus, Vorbis, FLAC, etc.)
  - Bitrate estimation
  - Duration (mm:ss format)

### Presets (20 Available)

**Neutral & Reference:**
- **Flat** - No processing, neutral sound
- **Audiophile** - Subtle enhancement for critical listening

**Movies & TV:**
- **Movie** - Enhanced bass/treble, moderate compression
- **Dialogue** - Boosted mids, aggressive compression for voices
- **Cinematic** - Wide soundstage for immersive films
- **Night** - Heavy compression for late-night viewing

**Music Genres:**
- **Music** - Balanced enhancement for general music
- **Rock** - Heavy bass and treble for rock music
- **Classical** - Natural, gentle sound for orchestral
- **Jazz** - Warm, balanced for jazz
- **Electronic** - Heavy bass + treble for EDM
- **Hip Hop** - Maximum bass with compression
- **Metal** - Aggressive bass and treble
- **Acoustic** - Natural sound, minimal processing
- **Lo-Fi** - Warm sound with reduced treble

**Speech & Content:**
- **Podcast** - Speech optimized with compression
- **Radio** - Heavily compressed for radio-style sound
- **Vocal** - Extreme mid boost for vocals

**Gaming & Bass:**
- **Gaming** - Immersive with heavy bass
- **Bass+** - Maximum bass boost

### Smart Settings
- **Per-Site Memory**: Automatically saves settings for each website
- **Global Defaults**: Set default settings for all sites
- **Tab-Specific**: Different settings for different tabs
- **Persistent**: Settings saved across browser sessions

### User Experience
- **Minimal UI**: Clean, modern interface with gradient design
- **Keyboard Shortcut**: Toggle on/off with `Cmd+Shift+A` (Mac) or `Ctrl+Shift+A` (Windows)
- **Visual Feedback**: Badge indicator shows when active
- **Real-time Values**: See exact dB values as you adjust
- **Collapsible Sections**: Hide advanced controls when not needed

## Installation

### From Source

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `AudioLift` folder

### Icons

Icons are automatically generated from the SVG source. To regenerate:

```bash
cd AudioLift
node generate-icons.js
```

Requirements: Node.js and Chrome/Chromium installed.

## Usage

### Quick Start

1. Click the AudioLift icon in your browser toolbar
2. Toggle "Enable AudioLift" on
3. Navigate to a video or audio page (e.g., YouTube, Netflix, Plex)
4. Adjust settings to your preference
5. Click "Save for this Site" to remember settings

### Presets

Click any preset button to apply predefined settings:

- **Movie**: Great for films with quiet dialogue
- **Dialogue**: Boost conversations in podcasts or videos
- **Bass Boost**: Enhance music and sound effects
- **Flat**: Reset to neutral (no processing)

### Custom Settings

#### Preamp
Overall volume boost. Useful when content is generally too quiet.
- Range: -10dB to +10dB
- Tip: Start with +2-4dB for movies

#### Bass (200Hz)
Low frequencies - rumble, bass, drums
- Range: -12dB to +12dB
- Tip: Boost +4-6dB for better immersion

#### Mid (1000Hz)
Mid frequencies - most vocals and instruments
- Range: -12dB to +12dB
- Tip: Boost +4-8dB for dialogue clarity

#### Treble (4000Hz)
High frequencies - clarity, detail, sibilance
- Range: -12dB to +12dB
- Tip: Boost +2-3dB for crisp audio

#### Dynamic Range Compression

Advanced controls to reduce the difference between quiet and loud sounds:

- **Threshold**: Level above which compression starts (default: -24dB)
  - Lower = more compression
  - Try -35dB for heavy compression (dialogue preset)

- **Ratio**: How much to compress (default: 3:1)
  - Higher = more aggressive compression
  - Try 6:1 for dialogue, 3-4:1 for movies

- **Knee**: How smoothly compression engages (default: 30dB)
  - Higher = smoother, more natural
  - Lower = more aggressive

### Keyboard Shortcuts

- `Cmd+Shift+A` (Mac) or `Ctrl+Shift+A` (Windows): Toggle AudioLift on/off

### Saving Settings

- **Save for this Site**: Remembers settings for the current domain (e.g., youtube.com)
- **Save as Default**: Sets global default settings for all sites

## Technical Details

### How It Works

AudioLift uses the Web Audio API to process audio in real-time:

1. Detects all `<audio>` and `<video>` elements on the page
2. Creates an audio processing chain:
   - Source → Preamp → Bass Filter → Mid Filter → Treble Filter → Compressor → Output
3. Uses BiquadFilterNode for EQ (lowshelf, peaking, highshelf)
4. Uses DynamicsCompressorNode for compression
5. All processing happens in real-time with zero latency

### Browser Compatibility

- Chrome 88+
- Edge 88+
- Any Chromium-based browser with Manifest V3 support

### Performance

- Minimal CPU usage (< 1% on modern hardware)
- Zero latency audio processing
- No impact on video playback

## Troubleshooting

### Audio not working?
- Refresh the page after enabling AudioLift
- Some sites may load media dynamically - try toggling off/on
- Check that media is actually playing

### Distorted audio?
- Lower the Preamp setting
- Reduce EQ boost values
- Decrease compression ratio

### Settings not saving?
- Make sure you click "Save for this Site" or "Save as Default"
- Check Chrome's storage permissions

## Development

### Project Structure

```
AudioLift/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html            # UI markup
├── popup.js              # UI logic and settings management
├── styles.css            # UI styling
├── content-script.js     # Audio processing (Web Audio API)
├── background.js         # Service worker (keyboard shortcuts)
├── icons/                # Extension icons
├── generate-icons.js     # Icon generator script
├── CHANGELOG.md          # Version history
├── README.md             # This file
└── claude.md             # Development directives
```

### Building

No build process required - this is vanilla JavaScript.

### Testing

1. Load the extension in Developer mode
2. Navigate to any page with audio/video
3. Open DevTools console to see any errors
4. Test on multiple sites (YouTube, Netflix, Plex, etc.)

## Privacy

AudioLift:
- Does NOT collect any data
- Does NOT send any information to external servers
- Does NOT track your browsing
- Only stores your settings locally in Chrome's storage

All audio processing happens locally in your browser.

## Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use and modify.

## Credits

Created with Claude Code.

## Version

Current version: 2.0.0

See [CHANGELOG.md](CHANGELOG.md) for version history.

## What's New in 2.0

- **Chrome Minimal Design** - Clean, flat UI inspired by Chrome's Material Design
- **Audio Information Display** - Real-time codec, bitrate, sample rate, and channel info
- **20 Presets** - Expanded from 12 to 20 including Electronic, Hip Hop, Metal, Vocal, Cinematic, Radio, and Lo-Fi
- **Smaller Footprint** - Reduced popup width (360px) for less screen space
