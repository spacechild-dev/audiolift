// Icon Generator Script
// This script converts SVG to PNG using Node.js canvas or headless browser

const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function generateIcons() {
  console.log('Generating icons...');

  const sizes = [
    { size: 16, name: 'icon16.png' },
    { size: 48, name: 'icon48.png' },
    { size: 128, name: 'icon128.png' }
  ];

  // Try using Chrome headless
  try {
    // Find Chrome executable
    const chromePaths = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'google-chrome',
      'chromium-browser'
    ];

    let chromePath = null;
    for (const path of chromePaths) {
      if (fs.existsSync(path)) {
        chromePath = path;
        break;
      }
    }

    if (!chromePath) {
      // Try to find in PATH
      try {
        await execAsync('which google-chrome');
        chromePath = 'google-chrome';
      } catch {
        try {
          await execAsync('which chromium-browser');
          chromePath = 'chromium-browser';
        } catch {
          throw new Error('Chrome not found');
        }
      }
    }

    console.log('Using Chrome at:', chromePath);

    for (const { size, name } of sizes) {
      const svgPath = `${__dirname}/icons/icon.svg`;
      const pngPath = `${__dirname}/icons/${name}`;

      // Create a temporary HTML file
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; width: ${size}px; height: ${size}px; }
            svg { width: ${size}px; height: ${size}px; }
          </style>
        </head>
        <body>
          ${fs.readFileSync(svgPath, 'utf8')}
        </body>
        </html>
      `;

      const tempHtml = `${__dirname}/icons/temp-${size}.html`;
      fs.writeFileSync(tempHtml, html);

      // Use headless Chrome to render and screenshot
      const command = `"${chromePath}" --headless --screenshot="${pngPath}" --window-size=${size},${size} --default-background-color=0 "${tempHtml}"`;

      try {
        await execAsync(command);
        console.log(`Generated ${name}`);
      } catch (error) {
        console.error(`Error generating ${name}:`, error.message);
      }

      // Clean up temp file
      fs.unlinkSync(tempHtml);
    }

    console.log('Icons generated successfully!');

  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nAlternative methods:');
    console.log('1. Install ImageMagick: brew install imagemagick (Mac) or apt-get install imagemagick (Linux)');
    console.log('2. Use online converter: https://convertio.co/svg-png/');
    console.log('3. Use Inkscape: inkscape -w 128 -h 128 icons/icon.svg -o icons/icon128.png');
  }
}

generateIcons();
