/**
 * Test script to validate Sonics CSV conversion
 */

import fs from 'fs';
import { csvToGeoJSON } from './src/utils/dataConverters.js';
import { validateGeoJSON } from './src/utils/dataValidator.js';

const csvPath = './public/examples/sonics_timeline_transformed.csv';

console.log('Testing Sonics Timeline CSV...\n');

try {
  // Read the CSV
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  console.log('✓ CSV file read successfully');
  console.log('File size:', csvContent.length, 'bytes\n');

  // Convert to GeoJSON
  console.log('Converting to GeoJSON...');
  const geojson = csvToGeoJSON(csvContent);
  console.log('✓ Conversion successful');
  console.log('Features created:', geojson.features.length, '\n');

  // Show first feature
  console.log('First feature:');
  console.log(JSON.stringify(geojson.features[0], null, 2));
  console.log('\n');

  // Validate
  console.log('Validating GeoJSON...');
  const validation = validateGeoJSON(geojson);

  if (validation.valid) {
    console.log('✓ Validation passed!\n');
    console.log('Stats:');
    console.log('  Features:', validation.stats.featureCount);
    console.log('  Points:', validation.stats.pointCount);
    console.log('  Time range:', new Date(validation.stats.timeRange.min).toISOString(), 'to', new Date(validation.stats.timeRange.max).toISOString());
    console.log('  Time span:', validation.stats.timeSpan.years, 'years');
  } else {
    console.log('✗ Validation failed!');
    console.log('Errors:', validation.errors);
  }

  if (validation.warnings.length > 0) {
    console.log('\nWarnings:');
    validation.warnings.forEach(w => console.log('  -', w));
  }

} catch (error) {
  console.error('✗ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
