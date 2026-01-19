import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to wait/delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function captureTimeline() {
  console.log('Starting timeline capture...');

  // Create screenshots directory
  const screenshotsDir = join(__dirname, '../screenshots');
  if (!existsSync(screenshotsDir)) {
    mkdirSync(screenshotsDir, { recursive: true });
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: {
      width: 1920,
      height: 1440,
      deviceScaleFactor: 2 // 2x for high resolution
    }
  });

  const page = await browser.newPage();

  // Navigate to the app
  console.log('Loading map application...');
  await page.goto('http://localhost:5174', {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  // Wait for map to be fully loaded
  await page.waitForSelector('.time-slider-map', { timeout: 10000 });
  await page.waitForSelector('.map-container canvas', { timeout: 10000 });

  // Give MapLibre time to render
  await delay(2000);

  // Check if data is loaded by looking at the time slider
  console.log('Checking if data is loaded...\n');

  // First, let's see what values we have
  const sliderDebug = await page.evaluate(() => {
    const slider = document.querySelector('.time-slider');
    if (!slider) return { exists: false };

    return {
      exists: true,
      min: slider.min,
      max: slider.max,
      value: slider.value
    };
  });

  console.log('Slider debug info:', sliderDebug);

  let timeInfo = await page.evaluate(() => {
    const slider = document.querySelector('.time-slider');
    if (!slider) return null;

    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);

    // Valid data should have min < max and neither should be 0
    if (min < max && min > 0) {
      return {
        min: min,
        max: max,
        current: parseFloat(slider.value)
      };
    }
    return null;
  });

  if (!timeInfo) {
    console.log('\n⚠️  Please load your data:');
    console.log('   1. Keep this script running');
    console.log('   2. In your browser at http://localhost:5174');
    console.log('   3. Click "📤 Upload Data" button');
    console.log('   4. Upload your sonics_timeline_transformed.csv file');
    console.log('   5. Waiting for data to load...\n');

    // Poll every 2 seconds for data to be loaded
    let attempts = 0;
    while (!timeInfo && attempts < 45) { // 90 seconds max
      await delay(2000);

      const debugInfo = await page.evaluate(() => {
        const slider = document.querySelector('.time-slider');
        if (!slider) return { exists: false };

        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);

        return {
          exists: true,
          min: min,
          max: max,
          value: parseFloat(slider.value),
          isValid: (min < max && min > 0)
        };
      });

      if (debugInfo.isValid) {
        timeInfo = {
          min: debugInfo.min,
          max: debugInfo.max,
          current: debugInfo.value
        };
      }

      attempts++;
      if (attempts % 5 === 0) {
        console.log(`   Still waiting... (${attempts * 2}s) - Slider: min=${debugInfo.min}, max=${debugInfo.max}, valid=${debugInfo.isValid}`);
      }
    }

    if (!timeInfo) {
      console.error('\n✗ Timeout: Data was not loaded after 90 seconds.');
      await browser.close();
      return;
    }

    console.log('✓ Data detected! Starting capture...\n');
    await delay(2000);
  } else {
    console.log('✓ Data already loaded\n');
  }

  console.log(`Time range: ${new Date(timeInfo.min).toDateString()} to ${new Date(timeInfo.max).toDateString()}`);

  // Calculate monthly intervals
  const startDate = new Date(timeInfo.min);
  const endDate = new Date(timeInfo.max);

  const screenshots = [];
  let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  let index = 0;
  while (currentDate <= endDate) {
    const timestamp = currentDate.getTime();

    // Set the slider to this timestamp
    await page.evaluate((ts) => {
      const slider = document.querySelector('.time-slider');
      if (slider) {
        slider.value = ts;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        slider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, timestamp);

    // Wait for map to update
    await delay(1500);

    // Take screenshot
    const filename = `${String(index).padStart(3, '0')}_${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}.png`;
    const filepath = join(screenshotsDir, filename);

    await page.screenshot({
      path: filepath,
      type: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 1920,
        height: 1440
      }
    });

    console.log(`✓ Captured: ${filename} (${new Date(timestamp).toDateString()})`);
    screenshots.push(filename);

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    index++;
  }

  console.log(`\nCapture complete! ${screenshots.length} screenshots saved to ${screenshotsDir}`);
  console.log('\nScreenshots:');
  screenshots.forEach(f => console.log(`  - ${f}`));

  await browser.close();
}

// Run the script
captureTimeline().catch(err => {
  console.error('Error capturing timeline:', err);
  process.exit(1);
});
