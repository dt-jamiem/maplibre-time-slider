# Data Import Guide

## Overview

The MapLibre Time Slider now supports importing your own temporal geographic data in multiple formats! This guide explains how to use the new import features.

## Supported Formats

### 1. CSV (Comma-Separated Values)
**Best for:** Simple point data, easy to create in Excel/Google Sheets

**Required columns:**
- `date` or `timestamp` - When the event occurred
- `latitude` or `lat` - Latitude in decimal degrees
- `longitude` or `lon` - Longitude in decimal degrees

**Optional columns:**
- Any additional data you want (shown in popups)

**Example:**
```csv
date,latitude,longitude,name,description
2021-01-01,37.7749,-122.4194,San Francisco,Tech hub
2021-06-15,40.7128,-74.0060,New York,Financial center
```

### 2. Simple JSON
**Best for:** Manual data entry, programmatic generation

**Structure:**
```json
[
  {
    "date": "2021-01-01",
    "lat": 37.7749,
    "lon": -122.4194,
    "name": "San Francisco",
    "type": "point"
  }
]
```

### 3. GeoJSON
**Best for:** GIS professionals, complex geometries

Standard GeoJSON FeatureCollection format with a `timestamp` property in each feature.

## How to Import Data

### Via User Interface

1. Click the "📤 Upload Data" button in the dataset selector
2. Either:
   - **Drag and drop** your file onto the upload area
   - **Click** the upload area to browse for a file
3. The file will be automatically:
   - Validated for errors
   - Converted to the internal format
   - Displayed on the map

### Try the Examples

Click any of the example buttons to instantly load sample data:
- **Cities (CSV)** - Historical US city founding dates
- **Routes (JSON)** - Explorer routes and territories
- **Events (GeoJSON)** - World historical events

## Features

### Automatic Format Detection
The app automatically detects your file format and converts it appropriately.

### Data Validation
Every file is validated before loading. You'll see:
- ✓ Success messages with dataset statistics
- ⚠ Warnings about potential issues
- ❌ Clear error messages if something is wrong

### Flexible Field Names
The converter accepts various common field names:
- **Date/Time:** `timestamp`, `date`, `time`, `year`, `datetime`
- **Latitude:** `latitude`, `lat`, `y`
- **Longitude:** `longitude`, `lon`, `lng`, `long`, `x`

### Multiple Geometry Types
Supports:
- **Points** - Single locations
- **LineStrings** - Routes, paths, roads
- **Polygons** - Territories, boundaries, areas

## Data Requirements

### Coordinates
- **Latitude:** -90 to 90 (decimal degrees)
- **Longitude:** -180 to 180 (decimal degrees)
- **Format:** Decimal degrees (e.g., 37.7749, not 37°46'29"N)

### Timestamps
Accept multiple formats:
- Unix timestamp in milliseconds: `1609459200000`
- ISO date string: `"2021-01-01"`
- Year only: `2021`

### File Size
- Maximum: 10 MB
- Recommended: Under 1 MB for best performance

## Tips for Best Results

### 1. Use Consistent Date Formats
All dates in your file should use the same format.

### 2. Include Descriptive Properties
Add meaningful names and descriptions - they appear in popups when clicking features.

### 3. Check Coordinate Order
- CSV/Simple JSON: latitude, longitude
- GeoJSON: [longitude, latitude] (note the reverse order!)

### 4. Validate Your Data
Common issues to check:
- Coordinates are within valid ranges
- Timestamps are in a recognized format
- CSV headers match your data columns
- GeoJSON is properly formatted

### 5. Start Small
Test with a small subset of your data first to ensure proper formatting.

## Example Datasets

Three example datasets are included in `public/examples/`:

1. **city_founding.csv** - US cities with founding dates
2. **explorer_routes.json** - Historical exploration routes
3. **world_events.geojson** - Major world events with locations

Use these as templates for your own data!

## Technical Details

### Converters
Located in `src/utils/dataConverters.js`:
- `csvToGeoJSON()` - Convert CSV to GeoJSON
- `simpleJSONToGeoJSON()` - Convert simple JSON to GeoJSON
- `autoConvertToGeoJSON()` - Auto-detect format and convert

### Validators
Located in `src/utils/dataValidator.js`:
- `validateFile()` - Check file before processing
- `validateGeoJSON()` - Validate converted data
- `getValidationSummary()` - Generate human-readable reports

## Troubleshooting

### "No timestamp field found"
Make sure your CSV has a column named: `timestamp`, `date`, `time`, or `year`

### "Coordinates out of range"
Check that:
- Latitude is between -90 and 90
- Longitude is between -180 and 180

### "Invalid JSON"
Verify your JSON is properly formatted using a validator like jsonlint.com

### "File too large"
Try:
- Reducing the number of features
- Simplifying polygon geometries
- Removing unnecessary properties

## Need Help?

See the full data format specification in `DATA_FORMAT_GUIDE.md`

## What's Next?

After loading your data:
1. Use the time slider to scrub through your timeline
2. Click the play button to animate
3. Click any feature to see its properties
4. Pan and zoom to explore your data
