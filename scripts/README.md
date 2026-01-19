# Timeline Capture Script

This script captures high-resolution screenshots of the map at monthly intervals throughout the timeline.

## Requirements

- The dev server must be running (`npm run dev`)
- Your data should be loaded in the application
- Puppeteer will be installed automatically

## Usage

1. **Start the dev server** (in one terminal):
   ```bash
   npm run dev
   ```

2. **Run the capture script** (in another terminal):
   ```bash
   npm run capture
   ```

3. **Sit back and watch**:
   - A Chrome browser window will open automatically
   - The script will automatically load the Sonics timeline data
   - It will capture screenshots at monthly intervals
   - You'll see progress in the terminal

4. **Find your screenshots**:
   - Screenshots will be saved to `screenshots/` folder
   - Files are named: `000_1964-12.png`, `001_1965-01.png`, etc.
   - High resolution: 1920x1440 @ 2x device pixel ratio (3840x2880 effective)

## Output

The script will:
- Capture one screenshot per month from the start to end of your timeline
- Show progress in the terminal as each screenshot is saved
- Display a summary when complete

Example output:
```
Starting timeline capture...
Loading map application...
Time range: Thu Jan 01 1965 to Sun Aug 01 1965
✓ Captured: 000_1965-01.png (Thu Jan 01 1965)
✓ Captured: 001_1965-02.png (Mon Feb 01 1965)
✓ Captured: 002_1965-03.png (Mon Mar 01 1965)
...
Capture complete! 8 screenshots saved to C:\Users\jamiem\maplibre-time-slider\screenshots
```

## Customization

You can edit `scripts/capture-timeline.js` to adjust:
- **Resolution**: Change `width`, `height`, and `deviceScaleFactor` in the viewport settings
- **Interval**: Modify the date increment (currently set to monthly)
- **Wait times**: Adjust timeouts if the map needs more time to render
- **File format**: Change from PNG to JPEG if needed

## Tips

- Make sure the custom data is loaded before running the script (not one of the preset datasets)
- The script waits 1.5 seconds between captures for the map to update
- Screenshots include the entire viewport (legend, controls, etc.)
- For best results, ensure the dev server has fully loaded before capturing

## Creating Videos or GIFs

You can use the screenshots to create animated visualizations:

### Using FFmpeg (Video)
```bash
cd screenshots
ffmpeg -framerate 2 -i %03d_*.png -c:v libx264 -pix_fmt yuv420p timeline.mp4
```

### Using ImageMagick (GIF)
```bash
cd screenshots
magick convert -delay 50 -loop 0 *.png timeline.gif
```
