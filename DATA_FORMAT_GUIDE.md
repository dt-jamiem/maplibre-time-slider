# Data Format Guide for MapLibre Time Slider

This guide explains the recommended file formats and structures for importing time and location data into the MapLibre Time Slider.

## Recommended Formats

### 1. GeoJSON (Recommended for GIS Users)

**Best for:** Users familiar with GIS tools, complex geometries, or existing GeoJSON data

**File extension:** `.geojson` or `.json`

**Structure:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-122.4194, 37.7749]
      },
      "properties": {
        "timestamp": 1609459200000,
        "name": "Event Name",
        "description": "Event description",
        "category": "Optional category",
        "customField": "Any additional data"
      }
    }
  ]
}
```

**Key Points:**
- Coordinates are `[longitude, latitude]` (note: longitude first!)
- Timestamp is Unix time in milliseconds (e.g., `new Date('2021-01-01').getTime()`)
- All properties are preserved and shown in popups
- Supports Point, LineString, and Polygon geometries

---

### 2. CSV (Recommended for Non-Technical Users)

**Best for:** Easy creation in Excel/Google Sheets, simple point data

**File extension:** `.csv`

**Structure for Points:**
```csv
timestamp,latitude,longitude,name,description,category
2021-01-01,37.7749,-122.4194,San Francisco Event,Description here,Culture
2021-06-15,40.7128,-74.0060,New York Event,Another description,Business
2022-03-20,41.8781,-87.6298,Chicago Event,More details,Technology
```

**Structure for Routes/Lines:**
```csv
timestamp,name,description,waypoints
2021-01-01,Route 1,First route,"40.7128,-74.0060;41.8781,-87.6298;29.7604,-95.3698"
2021-06-15,Route 2,Second route,"37.7749,-122.4194;34.0522,-118.2437"
```

**Key Points:**
- Dates in `YYYY-MM-DD` format (easier than timestamps)
- Latitude/longitude in decimal degrees
- Waypoints separated by semicolons for multi-point routes
- Headers are required
- Can include any number of custom columns

---

### 3. Simple JSON (Recommended for Developers)

**Best for:** Manual data entry, programmatic generation, simple structure

**File extension:** `.json`

**Structure:**
```json
[
  {
    "date": "2021-01-01",
    "lat": 37.7749,
    "lon": -122.4194,
    "name": "Event Name",
    "description": "Event description",
    "type": "point"
  },
  {
    "date": "2021-06-15",
    "name": "Route Name",
    "type": "line",
    "coordinates": [
      [40.7128, -74.0060],
      [41.8781, -87.6298]
    ]
  }
]
```

**Key Points:**
- More readable than GeoJSON
- Dates as strings (automatically converted)
- Latitude/longitude in decimal degrees
- Type field specifies geometry (point, line, polygon)

---

## Field Specifications

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `timestamp` or `date` | Number or String | When the event occurred | `1609459200000` or `"2021-01-01"` |
| `latitude` / `lat` | Number | Latitude in decimal degrees | `37.7749` |
| `longitude` / `lon` / `lng` | Number | Longitude in decimal degrees | `-122.4194` |

### Recommended Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` or `title` | String | Name of the event/location | `"Golden Gate Bridge"` |
| `description` | String | Detailed description | `"Opened to traffic"` |
| `category` or `type` | String | Classification | `"Infrastructure"` |

### Optional Fields

Add any custom fields you want - they'll all appear in the popup when clicking features.

---

## Timestamp Formats

The component accepts multiple timestamp formats:

### 1. Unix Timestamp (milliseconds)
```json
"timestamp": 1609459200000
```
Generate in JavaScript: `new Date('2021-01-01').getTime()`

### 2. ISO Date String
```json
"date": "2021-01-01"
```
Or with time: `"2021-01-01T12:00:00Z"`

### 3. Year Only
```json
"year": 2021
```
Converted to January 1st of that year

---

## Geometry Types

### Points
Single location at a specific time
```json
{
  "type": "Point",
  "coordinates": [-122.4194, 37.7749]
}
```

### LineStrings (Routes, Roads, Paths)
Sequence of connected points
```json
{
  "type": "LineString",
  "coordinates": [
    [-122.4194, 37.7749],
    [-118.2437, 34.0522],
    [-112.074, 33.4484]
  ]
}
```

### Polygons (Boundaries, Regions, Areas)
Closed shape representing an area
```json
{
  "type": "Polygon",
  "coordinates": [[
    [-109.05, 41.0],
    [-102.05, 41.0],
    [-102.05, 37.0],
    [-109.05, 37.0],
    [-109.05, 41.0]
  ]]
}
```
Note: First and last coordinates must be identical to close the polygon

---

## Complete Examples

### Example 1: Historical City Founding (CSV)

**File:** `city_founding.csv`
```csv
date,latitude,longitude,name,population,description
1624-01-01,40.7128,-74.0060,New York,33131,Founded as New Amsterdam
1776-01-01,37.7749,-122.4194,San Francisco,873965,Founded as Spanish mission
1833-01-01,41.8781,-87.6298,Chicago,2693976,Incorporated as a city
1869-01-01,47.6062,-122.3321,Seattle,753675,Incorporated as a city
```

### Example 2: Migration Route (GeoJSON)

**File:** `migration_route.geojson`
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-74.006, 40.7128]
      },
      "properties": {
        "timestamp": -10950739200000,
        "name": "Origin: New York",
        "year": 1624
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [
          [-74.006, 40.7128],
          [-87.6298, 41.8781],
          [-104.9903, 39.7392]
        ]
      },
      "properties": {
        "timestamp": -4165046400000,
        "name": "Westward Migration Route",
        "year": 1838,
        "description": "Migration path to Colorado"
      }
    },
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-104.9903, 39.7392]
      },
      "properties": {
        "timestamp": -2933856000000,
        "name": "Destination: Denver",
        "year": 1876
      }
    }
  ]
}
```

### Example 3: Territory Expansion (Simple JSON)

**File:** `territory_expansion.json`
```json
[
  {
    "date": "1803-04-30",
    "name": "Louisiana Purchase",
    "type": "polygon",
    "coordinates": [
      [40.0, -95.0],
      [50.0, -95.0],
      [50.0, -105.0],
      [40.0, -105.0],
      [40.0, -95.0]
    ],
    "description": "Acquired from France",
    "area_sq_miles": 828000
  },
  {
    "date": "1848-02-02",
    "name": "Mexican Cession",
    "type": "polygon",
    "coordinates": [
      [32.0, -117.0],
      [42.0, -117.0],
      [42.0, -109.0],
      [32.0, -109.0],
      [32.0, -117.0]
    ],
    "description": "Treaty of Guadalupe Hidalgo",
    "area_sq_miles": 525000
  }
]
```

---

## Tips for Creating Good Data

1. **Coordinate Precision:** Use 4-6 decimal places for accuracy
   - 4 decimals ≈ 11 meters accuracy
   - 6 decimals ≈ 11 centimeters accuracy

2. **Consistent Timestamps:** Use the same format throughout your dataset

3. **Descriptive Properties:** Include meaningful names and descriptions for better popups

4. **Data Validation:**
   - Latitude: -90 to 90
   - Longitude: -180 to 180
   - Ensure coordinates are [longitude, latitude] in GeoJSON

5. **File Size:** For large datasets (>1000 features), consider:
   - Splitting into multiple files by time period
   - Simplifying polygon geometries
   - Loading data dynamically based on time range

---

## Converting Between Formats

The application can include converters for:

- **CSV → GeoJSON:** Convert spreadsheet data to standard format
- **Simple JSON → GeoJSON:** Convert friendly format to standard
- **Excel → CSV:** Export from spreadsheet applications
- **Date strings → Unix timestamps:** Automatic conversion

Would you like example converter utilities added to the project?
