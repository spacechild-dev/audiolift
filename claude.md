# AudioLift - Development Directives

This document contains guidelines and directives for developing and maintaining the AudioLift Chrome extension.

## Project Overview

AudioLift is a Chrome extension that provides real-time audio enhancement for browser tabs using the Web Audio API. It offers EQ controls, dynamic range compression, and preset configurations for improved audio playback experience.

## Core Principles

1. **Minimal and Clean**: UI should remain minimal and uncluttered
2. **Real-time**: All audio processing must be real-time with zero perceptible latency
3. **Performance**: Minimal CPU usage, efficient audio graph
4. **Privacy-First**: No data collection, no external requests, all processing local
5. **User-Friendly**: Sensible defaults, helpful presets, clear feedback

## Technology Stack

### Required
- **Manifest V3**: Chrome extension manifest version 3
- **Web Audio API**: For all audio processing
- **Chrome Storage API**: For settings persistence
- **Vanilla JavaScript**: No frameworks, keep it lightweight

### Forbidden
- No external libraries for core functionality
- No analytics or tracking
- No external API calls
- No frameworks (React, Vue, etc.) - keep it vanilla

## Architecture

### File Structure
```
AudioLift/
├── manifest.json          # Extension configuration
├── popup.html/.js/.css    # User interface
├── content-script.js      # Audio processing
├── background.js          # Service worker
└── icons/                 # Extension icons
```

### Audio Processing Chain

The audio graph must maintain this order:
```
MediaElement → Preamp → Bass Filter → Mid Filter → Treble Filter → Compressor → Destination
```

**Filters:**
- Bass: BiquadFilterNode, type='lowshelf', frequency=200Hz
- Mid: BiquadFilterNode, type='peaking', frequency=1000Hz, Q=1
- Treble: BiquadFilterNode, type='highshelf', frequency=4000Hz
- Compressor: DynamicsCompressorNode

**Do NOT:**
- Change filter order (affects sound quality)
- Use gain.value directly for dB (use: `Math.pow(10, db/20)`)
- Create multiple AudioContext instances per page

## Code Style

### JavaScript
- Use ES6+ features (const/let, arrow functions, async/await)
- Use descriptive variable names
- Keep functions focused and single-purpose
- Always handle errors gracefully
- Use async/await over promise chains

### CSS
- Use CSS variables for theming
- Mobile-first approach (even though it's a desktop extension)
- Use flexbox/grid for layouts
- Keep specificity low
- No !important unless absolutely necessary

### HTML
- Semantic HTML
- Accessible (ARIA labels where needed)
- Keep structure flat and simple

## Settings Management

### Storage Strategy
```javascript
// Global settings (defaults for all sites)
globalSettings: {
  enabled: false,
  preamp: 0,
  bass: 0,
  // ...
}

// Tab-specific settings (for current session)
tabSettings_${tabId}: { /* ... */ }

// Domain-specific settings (persists across sessions)
domainSettings_${domain}: { /* ... */ }
```

### Priority Order
1. Tab-specific settings (highest priority)
2. Domain-specific settings
3. Global settings (fallback)

## Presets

### Required Presets
1. **Flat**: Neutral, no processing
2. **Movie**: For film content (bass+, mid-, treble+, moderate compression)
3. **Dialogue**: For speech clarity (mid++, compression++)
4. **Bass Boost**: For music (bass++)

### Adding New Presets
- Must have clear use case
- Must be tested on real content
- Must be documented in README
- Add to CHANGELOG under "Added"

## UI/UX Guidelines

### Layout
- Popup width: 320px
- Minimal padding/spacing
- Collapsible sections for advanced controls
- Real-time value display for all sliders

### Colors
- Primary: #667eea (purple-blue)
- Secondary: #764ba2 (purple)
- Use gradient for header
- Keep background white/light gray

### Feedback
- Show notifications for save actions
- Display badge when active
- Show current values next to sliders

## Versioning

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes to settings format or API
- **MINOR**: New features, new presets
- **PATCH**: Bug fixes, UI tweaks

### Version Update Checklist
1. Update version in `manifest.json`
2. Update version in `popup.html`
3. Add entry to `CHANGELOG.md`
4. Update README if features changed
5. Test on clean install
6. Test upgrade from previous version

## Testing Requirements

### Before Any Release
- [ ] Test on YouTube
- [ ] Test on Netflix/streaming service
- [ ] Test on Plex or similar
- [ ] Test on page with multiple videos
- [ ] Test settings persistence
- [ ] Test keyboard shortcut
- [ ] Test all presets
- [ ] Test in incognito mode
- [ ] Check console for errors
- [ ] Test on fresh install
- [ ] Test on upgrade from previous version

### Regression Testing
When changing audio processing:
- Test for audio distortion at various gain levels
- Verify no audio dropouts
- Check CPU usage (should be < 2%)
- Test with different media types (video, audio-only)

## Common Issues & Solutions

### Issue: Audio crackling/distortion
**Solution:** Check that gain values aren't too high. Add soft clipping or limiting.

### Issue: Settings not persisting
**Solution:** Verify Chrome storage API usage. Check for errors in background.js.

### Issue: Audio not processing
**Solution:** Ensure AudioContext is created after user gesture (autoplay policy). Check that media elements are detected.

### Issue: Multiple audio contexts
**Solution:** Reuse single AudioContext per page. Store in content script global.

## Performance Guidelines

### Optimization Rules
1. **Lazy initialization**: Only create audio context when enabled
2. **Reuse nodes**: Don't recreate audio graph unnecessarily
3. **Efficient observers**: Use MutationObserver efficiently, don't observe too much
4. **Debounce settings**: Don't update audio graph on every slider drag (use input event, not change)

### Benchmarks
- CPU usage: < 2% on modern hardware
- Memory: < 10MB per tab
- Audio graph creation: < 50ms

## Security Considerations

### Content Security Policy
- No inline scripts in HTML
- No eval() or Function() constructors
- No external resources

### Permissions
- Use minimal permissions
- Request only what's needed
- Explain permissions in README

### Data Privacy
- No data collection
- No external requests
- Settings stored locally only
- No user tracking

## Future Enhancements (Backlog)

### Planned Features
- Volume normalization
- Custom preset saving/loading
- Import/export settings
- Parametric EQ (more bands)
- Stereo width control
- Visual audio analyzer
- Dark mode

### Won't Implement
- Cloud sync (privacy concerns)
- Social features (out of scope)
- Video processing (audio only)
- System-wide audio (not possible in browser)

## Development Workflow

### Adding a New Feature
1. Update this document with specifications
2. Update CHANGELOG (Unreleased section)
3. Implement feature
4. Test thoroughly (see Testing Requirements)
5. Update README if user-facing
6. Update version numbers
7. Move CHANGELOG entry to new version section

### Bug Fix Workflow
1. Reproduce the bug
2. Write test case if applicable
3. Fix the issue
4. Test the fix
5. Add to CHANGELOG (patch version)
6. Update version numbers

### Code Review Checklist
- [ ] Follows code style guidelines
- [ ] No console.log (use console.error for errors)
- [ ] Proper error handling
- [ ] No performance regressions
- [ ] Documented in code if complex
- [ ] README updated if needed
- [ ] CHANGELOG updated

## API Reference

### Content Script Messages

```javascript
// Update settings
chrome.tabs.sendMessage(tabId, {
  type: 'updateSettings',
  settings: { /* ... */ }
});

// Get status
chrome.tabs.sendMessage(tabId, {
  type: 'getStatus'
});
// Response: { enabled: boolean }
```

### Storage Schema

```javascript
// Global settings
{
  globalSettings: {
    enabled: boolean,
    preamp: number,        // -10 to 10 dB
    bass: number,          // -12 to 12 dB
    mid: number,           // -12 to 12 dB
    treble: number,        // -12 to 12 dB
    compressionThreshold: number,  // -60 to 0 dB
    compressionRatio: number,      // 1 to 20
    compressionKnee: number,       // 0 to 40 dB
    compressionAttack: number,     // seconds
    compressionRelease: number     // seconds
  }
}
```

## Support & Maintenance

### User Support
- GitHub Issues for bug reports
- Detailed issue template
- Reproduction steps required
- Browser version required

### Maintenance Schedule
- Check for Chrome API changes: Quarterly
- Test on latest Chrome: Monthly
- Review dependencies: N/A (no dependencies)
- Security audit: Annually

## Contact & Resources

- **Chrome Extension Docs**: https://developer.chrome.com/docs/extensions/
- **Web Audio API Docs**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **Manifest V3 Migration**: https://developer.chrome.com/docs/extensions/mv3/intro/

## Notes for AI Assistants

When working on this project:
1. Always update CHANGELOG.md for any feature/fix
2. Maintain the version number consistency
3. Test thoroughly before marking work complete
4. Keep code vanilla JavaScript (no frameworks)
5. Preserve the minimal UI aesthetic
6. Performance is critical - always profile changes
7. Privacy is non-negotiable - no external calls
8. Follow the established audio processing chain
9. Document any complex audio processing logic

## Last Updated

2025-10-25 - v1.0.0 initial release
