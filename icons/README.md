# Icons

## Quick Setup

PNG icons need to be generated from the SVG source. Here are the easiest methods:

### Option 1: Online Converter (Fastest)
1. Go to https://convertio.co/svg-png/ or https://cloudconvert.com/svg-to-png
2. Upload `icon.svg`
3. Convert to PNG at these sizes:
   - 16x16 → save as `icon16.png`
   - 48x48 → save as `icon48.png`
   - 128x128 → save as `icon128.png`
4. Place the PNG files in this directory

### Option 2: ImageMagick (Recommended for local)
```bash
brew install imagemagick  # Mac
# or
apt-get install imagemagick  # Linux

# Generate icons
convert -background none -resize 16x16 icon.svg icon16.png
convert -background none -resize 48x48 icon.svg icon48.png
convert -background none -resize 128x128 icon.svg icon128.png
```

### Option 3: Inkscape
```bash
inkscape -w 16 -h 16 icon.svg -o icon16.png
inkscape -w 48 -h 48 icon.svg -o icon48.png
inkscape -w 128 -h 128 icon.svg -o icon128.png
```

### Option 4: Use Node script (if Chrome installed)
The included `generate-icons.js` script attempts to use Chrome headless, but may not work on all systems.

## Current Files
- `icon.svg` - Source SVG (gradient purple background with equalizer bars)
- `icon16.png` - ✓ Generated (16x16)
- `icon48.png` - ✓ Generated (48x48)
- `icon128.png` - ✓ Generated (128x128)
