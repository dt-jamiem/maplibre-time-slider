import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to wait/delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to wait for user input
const waitForEnter = () => new Promise((resolve) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Press ENTER when your data is loaded...', () => {
    rl.close();
    resolve();
  });
});

async function captureTimeline() {
  console.log('Starting timeline capture...');

  // Create screenshots directory
  const screenshotsDir = join(__dirname, '../screenshots');
  if (!existsSync(screenshotsDir)) {
    mkdirSync(screenshotsDir, { recursive: true });
  }

  // Launch browser (visible so you can interact with it)
  const browser = await puppeteer.launch({
    headless: false, // Make browser visible!
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

  // Prompt user to load data
  console.log('\n📋 INSTRUCTIONS:');
  console.log('   A Chrome browser window should have opened automatically.');
  console.log('   In that browser window:');
  console.log('   1. Click "📤 Upload Data" button');
  console.log('   2. Upload your sonics_timeline_transformed.csv file');
  console.log('   3. Wait for the map to show your data');
  console.log('   4. Come back to this terminal and press ENTER\n');

  await waitForEnter();

  console.log('\n✓ Proceeding with capture...');
  console.log('Waiting for map to fully update...\n');
  await delay(5000); // Give more time for the map to update

  // Get the time range from the slider
  let timeInfo = await page.evaluate(() => {
    const slider = document.querySelector('.time-slider');
    if (!slider) return null;

    return {
      min: parseFloat(slider.min),
      max: parseFloat(slider.max),
      current: parseFloat(slider.value)
    };
  });

  console.log('Slider values:', timeInfo);

  if (!timeInfo || timeInfo.min === timeInfo.max) {
    console.error('✗ Could not find valid time slider data. Make sure the data is loaded.');
    await browser.close();
    return;
  }

  // Show dates for verification
  const minDate = new Date(timeInfo.min);
  const maxDate = new Date(timeInfo.max);
  console.log(`Time range: ${minDate.toDateString()} to ${maxDate.toDateString()}`);
  console.log(`Raw values: min=${timeInfo.min}, max=${timeInfo.max}\n`);

  // Ask for confirmation if the dates look wrong
  if (minDate.getFullYear() < 1900 || minDate.getFullYear() > 2100) {
    console.error('⚠️  Warning: The dates look incorrect!');
    console.error(`   Found year: ${minDate.getFullYear()}`);
    console.error('   Make sure the data is fully loaded in the browser.');
    console.error('   Try refreshing the page and uploading again.\n');
    await browser.close();
    return;
  }

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
