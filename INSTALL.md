# AudioLift - Installation & Testing Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Extension

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions/`
   - OR click: Menu (⋮) → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" switch in the top-right corner
   - This enables loading unpacked extensions

3. **Load AudioLift**
   - Click "Load unpacked" button
   - Navigate to and select: `/Volumes/dev/browser-apps/AudioLift/AudioLift-v1.0.0`
   - Click "Select" or "Open"

4. **Verify Installation**
   - You should see "AudioLift v1.1.0" card in your extensions
   - The extension icon should appear in your Chrome toolbar
   - Status should show "On" (enabled)

### Step 2: First Test

1. **Go to YouTube**
   - Open a new tab
   - Navigate to https://www.youtube.com
   - Play any video

2. **Activate AudioLift**
   - Click the AudioLift icon in toolbar
   - Toggle the master switch ON (top-right)
   - You should see "ON" badge on the icon

3. **Try a Preset**
   - Click "🎬 Movie" preset button
   - You should hear the audio change
   - Try other presets to hear the difference

4. **Adjust Settings**
   - Move the Bass slider up (+5)
   - You should hear more bass immediately
   - Move the Preamp slider up (+3)
   - Volume should increase

✅ **If you can hear changes, the extension is working!**

---

## 🧪 Complete Testing Checklist

### Basic Functionality
- [ ] Extension loads without errors
- [ ] Icon appears in toolbar
- [ ] Popup opens when clicking icon
- [ ] Master toggle switches on/off
- [ ] Badge shows "ON" when enabled

### Audio Processing
- [ ] Audio changes when toggling on/off
- [ ] Presets change the sound noticeably
- [ ] EQ sliders adjust audio in real-time
- [ ] Preamp slider increases volume
- [ ] Compression controls affect dynamic range

### UI/UX
- [ ] All sliders work smoothly
- [ ] Value displays update in real-time
- [ ] Help modal (?) opens and closes
- [ ] Preset buttons highlight when clicked
- [ ] Auto-save notification appears

### Settings Persistence
- [ ] Settings save automatically (wait 2 seconds)
- [ ] Close popup and reopen - settings should persist
- [ ] Refresh page - settings should persist
- [ ] Close tab, open new YouTube tab - settings should apply

### Keyboard Shortcut
- [ ] Press `Cmd+Shift+A` (Mac) or `Ctrl+Shift+A` (Windows)
- [ ] Extension should toggle on/off
- [ ] Badge should appear/disappear

### Multi-Site Testing

Test on these sites to verify compatibility:

**YouTube** ✓ (Primary test site)
- URL: https://www.youtube.com
- Should work on all videos
- Test: Play video, toggle on/off, try Movie preset

**Netflix** (if you have subscription)
- URL: https://www.netflix.com
- Should work on streaming content
- Test: Dialogue preset for movies

**Spotify Web Player**
- URL: https://open.spotify.com
- Should work with music playback
- Test: Music or Rock presets

**Twitch**
- URL: https://www.twitch.tv
- Should work with live streams
- Test: Gaming preset

**Any HTML5 Video**
- Find any site with `<video>` or `<audio>` tags
- Should automatically detect and process

### Error Scenarios

Test these edge cases:

- [ ] **No media on page:** Popup should open, controls work, but nothing to process
- [ ] **Toggle before video loads:** Should work when video starts
- [ ] **Multiple videos on page:** All should be processed
- [ ] **Video loaded after page:** MutationObserver should detect it
- [ ] **Incognito mode:** Extension should work if enabled for incognito

---

## 🐛 Troubleshooting

### Extension doesn't load
**Symptoms:** Error when loading unpacked
**Solutions:**
- Verify you selected the correct folder (`AudioLift-v1.0.0`)
- Check that `manifest.json` exists in the folder
- Look at error message for specific issues

### Popup doesn't open
**Symptoms:** Clicking icon does nothing
**Solutions:**
- Check Chrome's console for errors (F12 → Console)
- Reload the extension: `chrome://extensions/` → Click reload icon
- Verify `popup.html` exists

### Audio doesn't change
**Symptoms:** Toggle on, but no audio difference
**Solutions:**
- Refresh the page after enabling
- Check that video is actually playing
- Open DevTools (F12) → Console tab → Look for "AudioLift:" messages
- Try toggling off and on again
- Check if media is CORS-restricted (console will show warning)

### Settings don't save
**Symptoms:** Settings reset when reopening popup
**Solutions:**
- Wait 2 seconds after changing settings (auto-save debounce)
- Check Chrome storage: `chrome://extensions/` → AudioLift → "Inspect views: service worker"
- Verify Chrome storage permissions in manifest

### Keyboard shortcut doesn't work
**Symptoms:** Cmd+Shift+A does nothing
**Solutions:**
- Check `chrome://extensions/shortcuts` for conflicts
- Verify the shortcut is registered for AudioLift
- Try clicking extension icon manually instead

### Console shows errors
**Common errors and meanings:**

```
InvalidStateError: Failed to construct 'MediaElementAudioSourceNode'
→ Media element already connected (possibly by another extension)
→ This is OK, AudioLift handles it gracefully

NotSupportedError: CORS-restricted media
→ Media is from another origin and blocks audio processing
→ Expected limitation, cannot be fixed

AudioContext suspended
→ Browser autoplay policy, will resume on user interaction
→ Click anywhere on page, AudioLift will resume automatically
```

---

## 📊 What to Look For

### Success Indicators

✅ **Console messages:**
```
AudioLift: Found X media elements
AudioLift: Processing new media element
AudioLift: Media source created, building audio chain...
AudioLift: ✓ Connected successfully! enabled: true
AudioLift: Settings applied to X media elements
```

✅ **Badge:**
- Shows "ON" when active (purple background)
- Disappears when disabled

✅ **Audible changes:**
- Toggle on/off → Clear difference
- Dialogue preset → Voices more clear
- Bass+ preset → More bass/rumble
- Preamp +5dB → Noticeably louder

### Red Flags

❌ **No console messages** → Extension not loading on page
❌ **Multiple "Failed to construct" errors** → Issue with audio graph
❌ **Settings reset every time** → Storage not working
❌ **No audio change at all** → Audio processing not working

---

## 🔍 Debug Mode

To see detailed logs:

1. Open YouTube
2. Press F12 (DevTools)
3. Go to Console tab
4. Filter by "AudioLift" (use search box)
5. Reload page
6. Watch messages as extension initializes

You should see:
```
AudioLift: Found 1 media elements
AudioLift: Processing new media element VIDEO 0
AudioLift: Media not ready yet, waiting for events...
AudioLift: loadedmetadata event fired
AudioLift: Media ready, setting up audio...
AudioLift: Created AudioContext
AudioLift: Creating media source...
AudioLift: Media source created, building audio chain...
AudioLift: ✓ Connected successfully! enabled: false
```

Then toggle extension ON in popup:
```
AudioLift: Received updateSettings message: {enabled: true, ...}
AudioLift: Settings applied to 1 media elements
```

---

## 📦 Package for Distribution (Optional)

If you want to share or submit to Chrome Web Store:

1. **Create ZIP:**
   ```bash
   cd /Volumes/dev/browser-apps/AudioLift
   zip -r AudioLift-v1.1.0.zip AudioLift-v1.0.0 \
     -x "*.git/*" \
     -x "*.DS_Store" \
     -x "*/node_modules/*"
   ```

2. **Verify ZIP contents:**
   - Should contain: manifest.json, popup.html, popup.js, content-script.js, background.js, styles.css, icons/
   - Should NOT contain: .git/, node_modules/, *.old files

3. **Upload to Chrome Web Store:**
   - Go to: https://chrome.google.com/webstore/devconsole
   - Create developer account ($5 one-time fee)
   - Click "New Item"
   - Upload ZIP file
   - Fill in store listing details
   - Submit for review

---

## 🎉 Next Steps

Once testing is complete:

1. ✅ **Mark passing tests** in STATUS.md
2. 📝 **Document any issues** found
3. 🐛 **Report bugs** if discovered
4. 💡 **Suggest features** for future versions
5. ⭐ **Enjoy enhanced audio!**

---

## 📞 Getting Help

If you encounter issues:

1. **Check console** for error messages (F12)
2. **Review STATUS.md** for known limitations
3. **Read CHANGELOG.md** for recent changes
4. **Consult claude.md** for technical details

---

**Happy Testing!** 🎧

If everything works, you now have a fully functional audio enhancement extension for Chrome!
