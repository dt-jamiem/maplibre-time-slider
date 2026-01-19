import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  await page.waitForTimeout(2000);

  // Check if we need to load custom data
  const uploadButtonExists = await page.$('button:has-text("📤 Upload Data")');
  if (uploadButtonExists) {
    console.log('\n⚠️  Please load your data first:');
    console.log('   1. Keep this script running');
    console.log('   2. Open http://localhost:5174 in your browser');
    console.log('   3. Click "📤 Upload Data"');
    console.log('   4. Upload your CSV/GeoJSON file');
    console.log('   5. This script will automatically continue once data is loaded\n');

    // Wait for custom data to be loaded (button text changes to "✓ Custom Data")
    await page.waitForSelector('button:has-text("✓ Custom Data")', { timeout: 300000 }); // 5 minute timeout
    console.log('✓ Data loaded! Starting capture...\n');

    // Give it a moment to render
    await page.waitForTimeout(2000);
  } else {
    console.log('✓ Data already loaded\n');
  }

  // Get the time range from the slider
  const timeInfo = await page.evaluate(() => {
    const slider = document.querySelector('.time-slider');
    if (!slider) return null;

    return {
      min: parseFloat(slider.min),
      max: parseFloat(slider.max),
      current: parseFloat(slider.value)
    };
  });

  if (!timeInfo) {
    console.error('Could not find time slider. Make sure the map is loaded.');
    await browser.close();
    return;
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
    await page.waitForTimeout(1500);

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
