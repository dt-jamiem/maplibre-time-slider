/**
 * Data converter utilities for MapLibre Time Slider
 * Converts CSV and Simple JSON formats to GeoJSON
 */

/**
 * Parse a timestamp from various formats
 * @param {string|number} value - Date string, Unix timestamp, or year
 * @returns {number} Unix timestamp in milliseconds
 */
export function parseTimestamp(value) {
  if (typeof value === 'number') {
    // If it's a 4-digit number, assume it's a year
    if (value >= 1000 && value <= 9999) {
      return new Date(`${value}-01-01`).getTime();
    }
    // Otherwise assume it's already a Unix timestamp
    return value;
  }

  if (typeof value === 'string') {
    // Try parsing as a date string
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.getTime();
    }

    // Try parsing as a year
    const year = parseInt(value);
    if (!isNaN(year) && year >= 1000 && year <= 9999) {
      return new Date(`${year}-01-01`).getTime();
    }
  }

  throw new Error(`Invalid timestamp format: ${value}`);
}

/**
 * Parse CSV text into an array of objects
 * @param {string} csvText - CSV file content
 * @returns {Array<Object>} Array of row objects
 */
export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim());

  // Parse data rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parser (doesn't handle quoted commas)
    const values = line.split(',').map(v => v.trim());

    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Extract coordinate value from various field names
 * @param {Object} obj - Data object
 * @param {Array<string>} possibleFields - Possible field names
 * @returns {number|null} Coordinate value
 */
function extractField(obj, possibleFields) {
  for (const field of possibleFields) {
    if (obj[field] !== undefined && obj[field] !== null && obj[field] !== '') {
      const value = parseFloat(obj[field]);
      if (!isNaN(value)) {
        return value;
      }
    }
  }
  return null;
}

/**
 * Convert CSV data to GeoJSON
 * @param {string} csvText - CSV file content
 * @param {Object} options - Conversion options
 * @param {string} options.timeField - Name of timestamp field (auto-detected if not provided)
 * @returns {Object} GeoJSON FeatureCollection
 */
export function csvToGeoJSON(csvText, options = {}) {
  const rows = parseCSV(csvText);

  // Detect time field
  const timeFields = ['timestamp', 'date', 'time', 'year', 'datetime'];
  const timeField = options.timeField || timeFields.find(field => rows[0][field] !== undefined);

  if (!timeField) {
    throw new Error('No timestamp field found. CSV must include one of: timestamp, date, time, year');
  }

  const features = [];

  for (const row of rows) {
    try {
      // Extract coordinates
      const lat = extractField(row, ['latitude', 'lat', 'y']);
      const lon = extractField(row, ['longitude', 'lon', 'lng', 'long', 'x']);

      // Check for waypoints (multi-point routes)
      const waypoints = row.waypoints || row.coordinates || row.path;

      let geometry;

      if (waypoints) {
        // Parse waypoints for LineString
        const coords = waypoints.split(';').map(point => {
          const [lat, lon] = point.split(',').map(v => parseFloat(v.trim()));
          return [lon, lat]; // GeoJSON is [lon, lat]
        });
        geometry = {
          type: 'LineString',
          coordinates: coords
        };
      } else if (lat !== null && lon !== null) {
        // Single point
        geometry = {
          type: 'Point',
          coordinates: [lon, lat] // GeoJSON is [lon, lat]
        };
      } else {
        console.warn('Skipping row without valid coordinates:', row);
        continue;
      }

      // Parse timestamp
      const timestamp = parseTimestamp(row[timeField]);

      // Build properties (exclude coordinate fields)
      const properties = { timestamp };
      const excludeFields = ['latitude', 'lat', 'y', 'longitude', 'lon', 'lng', 'long', 'x', 'waypoints', 'coordinates', 'path'];

      for (const [key, value] of Object.entries(row)) {
        if (!excludeFields.includes(key.toLowerCase()) && key !== timeField) {
          properties[key] = value;
        }
      }

      features.push({
        type: 'Feature',
        geometry,
        properties
      });
    } catch (error) {
      console.warn('Error processing row:', row, error);
    }
  }

  return {
    type: 'FeatureCollection',
    features
  };
}

/**
 * Convert simple JSON format to GeoJSON
 * @param {Array<Object>|Object} jsonData - Simple JSON data
 * @param {Object} options - Conversion options
 * @returns {Object} GeoJSON FeatureCollection
 */
export function simpleJSONToGeoJSON(jsonData, options = {}) {
  // If it's already a GeoJSON FeatureCollection, return as is
  if (jsonData.type === 'FeatureCollection' && jsonData.features) {
    return jsonData;
  }

  // If it's a single object, wrap it in an array
  const data = Array.isArray(jsonData) ? jsonData : [jsonData];

  const features = [];

  for (const item of data) {
    try {
      // Detect time field
      const timeValue = item.timestamp || item.date || item.time || item.year || item.datetime;
      if (!timeValue) {
        console.warn('Skipping item without timestamp:', item);
        continue;
      }

      const timestamp = parseTimestamp(timeValue);

      // Determine geometry type
      const type = (item.type || 'point').toLowerCase();
      let geometry;

      if (type === 'point') {
        const lat = item.latitude || item.lat || item.y;
        const lon = item.longitude || item.lon || item.lng || item.x;

        if (lat === undefined || lon === undefined) {
          console.warn('Skipping point without coordinates:', item);
          continue;
        }

        geometry = {
          type: 'Point',
          coordinates: [parseFloat(lon), parseFloat(lat)]
        };
      } else if (type === 'line' || type === 'linestring' || type === 'route') {
        if (!item.coordinates || !Array.isArray(item.coordinates)) {
          console.warn('Skipping line without coordinates array:', item);
          continue;
        }

        geometry = {
          type: 'LineString',
          coordinates: item.coordinates.map(coord => {
            if (Array.isArray(coord)) {
              return coord.length === 2 ? [coord[1], coord[0]] : coord; // Assume [lat, lon] in simple format
            }
            return coord;
          })
        };
      } else if (type === 'polygon' || type === 'area') {
        if (!item.coordinates || !Array.isArray(item.coordinates)) {
          console.warn('Skipping polygon without coordinates array:', item);
          continue;
        }

        // Ensure the polygon is closed (first and last points are the same)
        let coords = item.coordinates.map(coord => {
          if (Array.isArray(coord)) {
            return coord.length === 2 ? [coord[1], coord[0]] : coord; // Assume [lat, lon] in simple format
          }
          return coord;
        });

        // Close the polygon if not already closed
        if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
          coords.push([...coords[0]]);
        }

        geometry = {
          type: 'Polygon',
          coordinates: [coords]
        };
      } else {
        console.warn('Unknown geometry type:', type);
        continue;
      }

      // Build properties (exclude coordinate and type fields)
      const properties = { timestamp };
      const excludeFields = ['latitude', 'lat', 'y', 'longitude', 'lon', 'lng', 'x', 'coordinates', 'type', 'timestamp', 'date', 'time', 'year', 'datetime'];

      for (const [key, value] of Object.entries(item)) {
        if (!excludeFields.includes(key)) {
          properties[key] = value;
        }
      }

      features.push({
        type: 'Feature',
        geometry,
        properties
      });
    } catch (error) {
      console.warn('Error processing item:', item, error);
    }
  }

  return {
    type: 'FeatureCollection',
    features
  };
}

/**
 * Auto-detect format and convert to GeoJSON
 * @param {string} data - File content as string
 * @param {string} filename - Original filename (for format detection)
 * @returns {Object} GeoJSON FeatureCollection
 */
export function autoConvertToGeoJSON(data, filename = '') {
  const ext = filename.toLowerCase().split('.').pop();

  // Try parsing as JSON first
  try {
    const jsonData = JSON.parse(data);

    // If it's already GeoJSON, return as is
    if (jsonData.type === 'FeatureCollection' && jsonData.features) {
      return jsonData;
    }

    // Otherwise convert from simple JSON
    return simpleJSONToGeoJSON(jsonData);
  } catch (jsonError) {
    // Not valid JSON, try CSV
    if (ext === 'csv' || data.includes(',')) {
      try {
        return csvToGeoJSON(data);
      } catch (csvError) {
        throw new Error(`Failed to parse as CSV: ${csvError.message}`);
      }
    }

    throw new Error(`Failed to parse data. Not valid JSON or CSV. JSON error: ${jsonError.message}`);
  }
}
