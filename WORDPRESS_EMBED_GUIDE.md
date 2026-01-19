# WordPress Embedding Guide

This guide will walk you through embedding the MapLibre Time Slider in your WordPress blog post.

## Quick Overview

There are three main steps:
1. **Build** the embeddable version
2. **Host** the files somewhere publicly accessible
3. **Embed** in your WordPress post

## Step 1: Build the Embeddable Version

Run the build command to create production-ready files:

```bash
npm run build
```

This creates a `dist` folder with two key files:
- `dist/embed.js` - The embeddable widget (your map component)
- `dist/index.html` - The demo application (optional)

You'll also need to upload your data file (e.g., `sonics_timeline_transformed.csv` converted to GeoJSON).

## Step 2: Host the Files

You need to host the `embed.js` file and your data file somewhere publicly accessible. Here are your options:

### Option A: GitHub Pages (Free & Easy)

1. **Enable GitHub Pages** for your repository:
   - Go to your GitHub repository: https://github.com/dt-jamiem/maplibre-time-slider
   - Click Settings → Pages
   - Under "Source", select "Deploy from a branch"
   - Select branch: `master` (or `main`) and folder: `/docs` or `/` (root)
   - Click Save

2. **Prepare your files**:
   ```bash
   # Copy build files to a docs folder (if using /docs option)
   mkdir docs
   cp dist/embed.js docs/
   cp public/examples/sonics_timeline_transformed.csv docs/

   # Convert CSV to GeoJSON if needed (or use the dataConverters utility)
   # Upload to docs folder
   ```

3. **Your files will be accessible at**:
   - Script: `https://dt-jamiem.github.io/maplibre-time-slider/embed.js`
   - Data: `https://dt-jamiem.github.io/maplibre-time-slider/sonics_timeline_transformed.geojson`

### Option B: Your Own Web Hosting

If you have web hosting (cPanel, FTP access, etc.):

1. Upload `dist/embed.js` to your server (e.g., `https://yoursite.com/maps/embed.js`)
2. Upload your GeoJSON data file (e.g., `https://yoursite.com/maps/sonics.geojson`)
3. Note the public URLs for the next step

### Option C: WordPress Media Library (Data Only)

You can upload the GeoJSON file to your WordPress Media Library:

1. Go to WordPress Admin → Media → Add New
2. Upload your `.geojson` file
3. Copy the file URL from the media library
4. You'll still need to host `embed.js` elsewhere (use Option A or B)

## Step 3: Embed in WordPress

### Method 1: Custom HTML Block (Recommended)

1. **In your WordPress post editor**, add a "Custom HTML" block
2. **Paste this code**:

```html
<!-- Load the map widget script -->
<script src="https://dt-jamiem.github.io/maplibre-time-slider/embed.js"></script>

<!-- Add the map element -->
<time-slider-map
  data-url="https://dt-jamiem.github.io/maplibre-time-slider/sonics_timeline_transformed.geojson"
  center="-122,47"
  zoom="6"
  time-field="timestamp"
></time-slider-map>
```

3. **Customize the attributes**:
   - `data-url`: Your GeoJSON file URL
   - `center`: Map center as "longitude,latitude" (e.g., "-122,47" for Seattle area)
   - `zoom`: Initial zoom level (1-20, higher = closer)
   - `time-field`: The property name containing timestamps (usually "timestamp")

### Method 2: Add to Theme (Site-wide)

If you want the map script available site-wide:

1. Go to **Appearance → Theme File Editor**
2. Open **functions.php**
3. Add this code:

```php
function enqueue_time_slider_map() {
    wp_enqueue_script(
        'time-slider-map',
        'https://dt-jamiem.github.io/maplibre-time-slider/embed.js',
        array(),
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'enqueue_time_slider_map');
```

4. Now you can use the `<time-slider-map>` element in any post without loading the script each time

### Method 3: Plugin for Custom HTML

If your WordPress.com plan doesn't allow Custom HTML:

1. Install the **"Insert Headers and Footers"** plugin
2. Go to **Settings → Insert Headers and Footers**
3. Paste the script tag in the "Scripts in Footer" section
4. Save
5. Now use the `<time-slider-map>` element in your posts

## Complete Example for The Sonics Timeline

```html
<script src="https://dt-jamiem.github.io/maplibre-time-slider/embed.js"></script>

<div style="max-width: 1200px; margin: 2rem auto;">
  <h2>The Sonics Chart History (1965)</h2>
  <p>
    Watch The Sonics' songs chart across the Pacific Northwest and California.
    Each color represents a different song, size shows chart position (#1 is largest),
    and opacity shows recency (bright = recent, faded = older).
  </p>

  <time-slider-map
    data-url="https://dt-jamiem.github.io/maplibre-time-slider/sonics.geojson"
    center="-122,45.5"
    zoom="5.5"
    time-field="timestamp"
  ></time-slider-map>

  <p style="margin-top: 1rem; font-size: 0.9em; color: #666;">
    Press play to watch the animation! Click any circle for details.
  </p>
</div>
```

## Troubleshooting

### Map doesn't appear
- Check browser console for errors (F12 → Console tab)
- Verify your script URL is accessible (visit it in a new tab)
- Verify your data URL is accessible and returns valid GeoJSON
- Some WordPress.com plans block custom scripts - you may need a Business plan or higher

### CORS Errors
If you see "Cross-Origin Request Blocked" errors:
- Make sure your data file is hosted on a server with proper CORS headers
- GitHub Pages automatically has correct CORS headers
- If self-hosting, add this to `.htaccess`:
  ```apache
  <IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
  </IfModule>
  ```

### Map is too small/large
Add inline styles to control size:
```html
<time-slider-map
  style="max-width: 1200px; margin: 0 auto;"
  data-url="..."
></time-slider-map>
```

### WordPress blocks the embed
- WordPress.com Free/Personal plans block custom JavaScript
- Upgrade to Business plan or higher
- Or use WordPress.org (self-hosted) which has no restrictions

## Advanced: Converting Your Data to GeoJSON

If you have CSV data, you can convert it to GeoJSON:

### Option 1: Use the demo app
1. Run `npm run dev`
2. Open http://localhost:5173
3. Upload your CSV file
4. The app converts it to GeoJSON automatically
5. Right-click the map → Inspect → Console
6. Type: `console.log(JSON.stringify(data))` to export

### Option 2: Use Node.js script
```javascript
// convert.js
import { csvToGeoJSON } from './src/utils/dataConverters.js';
import fs from 'fs';

const csv = fs.readFileSync('your-data.csv', 'utf-8');
const geojson = csvToGeoJSON(csv);
fs.writeFileSync('your-data.geojson', JSON.stringify(geojson, null, 2));
```

## Security Considerations

- Always validate and sanitize your GeoJSON data
- Use HTTPS URLs for both script and data
- Don't embed sensitive data - remember it's publicly accessible
- Consider hosting data on your own domain for better control

## Need Help?

- Check the main README.md for data format requirements
- Review DATA_FORMAT_GUIDE.md for GeoJSON structure
- Open an issue on GitHub: https://github.com/dt-jamiem/maplibre-time-slider/issues
