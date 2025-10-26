# Changelog

All notable changes to AudioLift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-25

### Added
- Initial release of AudioLift
- Real-time audio enhancement for browser tabs using Web Audio API
- 3-band equalizer (Bass, Mid, Treble) with ±12dB range
- Preamp/gain control with ±10dB range
- Dynamic range compression with adjustable threshold, ratio, and knee
- Four built-in presets:
  - **Flat**: No processing, neutral sound
  - **Movie**: Enhanced for film content with reduced mids and boosted bass/treble
  - **Dialogue**: Optimized for speech clarity with boosted mids and compression
  - **Bass Boost**: Enhanced low frequencies for music
- Per-site settings memory
- Global default settings
- Keyboard shortcut (Cmd+Shift+A / Ctrl+Shift+A) to toggle on/off
- Visual badge indicator when active
- Minimal, modern UI with gradient design
- Collapsible advanced controls section
- Real-time value display for all controls
- Settings persistence across browser sessions

### Technical Features
- Manifest V3 compliance
- Web Audio API integration
- BiquadFilterNode for EQ (lowshelf, peaking, highshelf)
- DynamicsCompressorNode for dynamic range control
- Automatic detection of audio/video elements
- MutationObserver for dynamically loaded media
- Chrome Storage API for settings persistence
- Tab-specific and domain-specific settings

### Browser Support
- Chrome 88+
- Edge 88+
- Any Chromium-based browser with Manifest V3 support

## [1.1.0] - 2025-10-25

### Added
- Completely redesigned UI - wider, more compact, Boom-style
- Interactive compression help modal with detailed explanations
- Tooltips for compression controls (hover to see tips)
- Vertical EQ sliders with visual grid layout
- Emoji icons for presets and actions
- Improved visual feedback and animations

### Fixed
- **Audio processing now works without page reload!** 🎉
- Toggle on/off applies instantly to playing media
- Settings changes (EQ, compression) apply in real-time
- Bypass mode instead of disconnect for smoother toggling
- Auto-save eliminates need for manual save buttons

### Changed
- Popup width increased from 320px to 400px
- Removed scrolling - everything fits in view
- Simplified compression controls layout
- Better contrast and modern gradient design
- Improved slider visual design
- Replaced manual save buttons with auto-save notification

### Technical
- **Implemented "always connected" architecture** - audio chain stays connected, toggle uses bypass mode
- **WeakMap/WeakSet for memory management** - automatic cleanup when elements removed from DOM
- **Graceful error handling** - handles InvalidStateError when element already connected
- **AudioContext auto-resume** - handles browser autoplay policy
- **DOM verification** - checks if element still exists before processing
- **Reprocessing on toggle** - ensures new elements are captured when enabled
- Better CORS error detection and logging

## [1.0.0] - 2025-10-25

### Added
- Initial release of AudioLift
- Real-time audio enhancement for browser tabs using Web Audio API
- 3-band equalizer (Bass, Mid, Treble) with ±12dB range
- Preamp/gain control with ±10dB range
- Dynamic range compression with adjustable threshold, ratio, and knee
- Four built-in presets:
  - **Flat**: No processing, neutral sound
  - **Movie**: Enhanced for film content with reduced mids and boosted bass/treble
  - **Dialogue**: Optimized for speech clarity with boosted mids and compression
  - **Bass Boost**: Enhanced low frequencies for music
- Per-site settings memory
- Global default settings
- Keyboard shortcut (Cmd+Shift+A / Ctrl+Shift+A) to toggle on/off
- Visual badge indicator when active
- Minimal, modern UI with gradient design
- Collapsible advanced controls section
- Real-time value display for all controls
- Settings persistence across browser sessions

### Technical Features
- Manifest V3 compliance
- Web Audio API integration
- BiquadFilterNode for EQ (lowshelf, peaking, highshelf)
- DynamicsCompressorNode for dynamic range control
- Automatic detection of audio/video elements
- MutationObserver for dynamically loaded media
- Chrome Storage API for settings persistence
- Tab-specific and domain-specific settings

### Browser Support
- Chrome 88+
- Edge 88+
- Any Chromium-based browser with Manifest V3 support

## [Unreleased]

### Planned Features
- Volume normalization
- Custom preset saving
- Import/export settings
- 3D audio effects (ambient, night mode)
- More preset options
- Advanced filter options (parametric EQ)
- Stereo width control
- Visual audio analyzer
- Dark mode for UI
- Side panel support
