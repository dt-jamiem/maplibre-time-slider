/**
 * Transform Sonics Timeline CSV from wide to long format
 * Converts chart data to map-friendly format with coordinates
 */

import fs from 'fs';
import path from 'path';

// City coordinates lookup
const cityCoordinates = {
  'Tacoma, Washington': { lat: 47.2529, lon: -122.4443 },
  'Seattle, Washington': { lat: 47.6062, lon: -122.3321 },
  'Vancouver, British Columbia': { lat: 49.2827, lon: -123.1207 },
  'Sacramento, California': { lat: 38.5816, lon: -121.4944 },
  'Boise, Idaho': { lat: 43.6150, lon: -116.2023 },
  'Lebanon, Oregon': { lat: 44.5365, lon: -122.9070 },
  'San Francisco, California': { lat: 37.7749, lon: -122.4194 },
  'Bend, Oregon': { lat: 44.0582, lon: -121.3153 },
  'Salem, Oregon': { lat: 44.9429, lon: -123.0351 },
  'San Jose, California': { lat: 37.3382, lon: -121.8863 },
  'Lewiston, Idaho': { lat: 46.4165, lon: -117.0177 },
  'Pittsburg, California': { lat: 38.0280, lon: -121.8847 },
  'Hoquiam, Washington': { lat: 46.9809, lon: -123.8894 },
  'Richland, Washington': { lat: 46.2856, lon: -119.2844 },
  'Honolulu, Hawaii': { lat: 21.3099, lon: -157.8581 },
  'Allentown, Pennsylvania': { lat: 40.6084, lon: -75.4902 },
  'Buffalo, New York': { lat: 42.8864, lon: -78.8784 },
  'Cleveland, Ohio': { lat: 41.4993, lon: -81.6944 },
  'Salt Lake City, Utah': { lat: 40.7608, lon: -111.8910 },
  'Arlington Heights, Illinois': { lat: 42.0883, lon: -87.9806 },
  'Bruswick, Georgia': { lat: 31.1500, lon: -81.4915 },
  'Eugene, Oregon': { lat: 44.0521, lon: -123.0868 },
  'Lansing, Michigan': { lat: 42.7325, lon: -84.5555 },
  'Monterey, California': { lat: 36.6002, lon: -121.8947 },
  'Orlando, Florida': { lat: 28.5383, lon: -81.3792 },
  'Pittsburgh, Pennsylvania': { lat: 40.4406, lon: -79.9959 },
  'Santa Barbara, California': { lat: 34.4208, lon: -119.6982 },
  'Bellingham, Washington': { lat: 48.7519, lon: -122.4787 }
};

function parseDate(dateString) {
  // Convert "1965-1" to "1965-01-01"
  const parts = dateString.split('-');
  if (parts.length === 2) {
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    return `${year}-${month}-01`;
  }
  return dateString;
}

function transformData(inputPath, outputPath) {
  console.log('Reading input file:', inputPath);
  const content = fs.readFileSync(inputPath, 'utf-8');

  // Remove BOM if present
  const cleanContent = content.replace(/^\uFEFF/, '');

  const lines = cleanContent.split('\n');
  const headers = lines[0].split(',');

  console.log('Found', headers.length, 'columns');
  console.log('Processing', lines.length, 'rows');

  // Extract date columns (skip Song, City, State)
  const dateColumns = headers.slice(3).map((h, i) => ({
    index: i + 3,
    date: h.trim()
  })).filter(d => d.date && d.date.match(/^\d{4}-\d{1,2}$/));

  console.log('Found', dateColumns.length, 'date columns');

  // Output data
  const outputRows = [];
  outputRows.push('date,latitude,longitude,song,city,state,chart_position');

  let recordCount = 0;
  let missingCoordinates = new Set();

  // Process each data row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === ','.repeat(headers.length - 1)) {
      // Skip empty rows
      continue;
    }

    const values = line.split(',');
    const song = values[0]?.trim();
    const city = values[1]?.trim();
    const state = values[2]?.trim();

    if (!song || !city || !state) {
      // Skip incomplete rows
      continue;
    }

    const cityKey = `${city}, ${state}`;
    const coords = cityCoordinates[cityKey];

    if (!coords) {
      missingCoordinates.add(cityKey);
      console.warn(`Warning: Missing coordinates for ${cityKey}`);
      // Use a default location for now (will be visible but not accurate)
      continue;
    }

    // Process each date column
    for (const dateCol of dateColumns) {
      const chartPosition = values[dateCol.index]?.trim();

      if (chartPosition && chartPosition !== '') {
        const date = parseDate(dateCol.date);

        // Create output row
        const outputRow = [
          date,
          coords.lat,
          coords.lon,
          song,
          city,
          state,
          chartPosition
        ].join(',');

        outputRows.push(outputRow);
        recordCount++;
      }
    }
  }

  console.log('\nTransformation complete!');
  console.log('- Total records created:', recordCount);
  console.log('- Date range:', dateColumns[0]?.date, 'to', dateColumns[dateColumns.length - 1]?.date);

  if (missingCoordinates.size > 0) {
    console.log('\nCities with missing coordinates (excluded from output):');
    missingCoordinates.forEach(city => console.log('  -', city));
  }

  // Write output
  fs.writeFileSync(outputPath, outputRows.join('\n'), 'utf-8');
  console.log('\nOutput written to:', outputPath);
  console.log('File is ready to upload to the map!');
}

// Run transformation
const inputPath = process.argv[2] || 'C:\\Users\\jamiem\\Downloads\\Sonics Timeline.csv';
const outputPath = process.argv[3] || 'C:\\Users\\jamiem\\maplibre-time-slider\\public\\examples\\sonics_timeline_transformed.csv';

try {
  transformData(inputPath, outputPath);
} catch (error) {
  console.error('Error transforming data:', error.message);
  process.exit(1);
}
