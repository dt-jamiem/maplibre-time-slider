/**
 * Data validation utilities for MapLibre Time Slider
 * Validates GeoJSON and provides helpful error messages
 */

/**
 * Validate coordinate values
 * @param {number} lon - Longitude
 * @param {number} lat - Latitude
 * @returns {Object} Validation result
 */
function validateCoordinates(lon, lat) {
  const errors = [];
  const warnings = [];

  if (typeof lon !== 'number' || isNaN(lon)) {
    errors.push(`Invalid longitude: ${lon}`);
  } else if (lon < -180 || lon > 180) {
    errors.push(`Longitude ${lon} out of range (-180 to 180)`);
  }

  if (typeof lat !== 'number' || isNaN(lat)) {
    errors.push(`Invalid latitude: ${lat}`);
  } else if (lat < -90 || lat > 90) {
    errors.push(`Latitude ${lat} out of range (-90 to 90)`);
  }

  // Check for common coordinate order mistake
  if (Math.abs(lon) <= 90 && Math.abs(lat) > 90) {
    warnings.push('Coordinates may be in wrong order. GeoJSON uses [longitude, latitude]');
  }

  return { errors, warnings };
}

/**
 * Validate a GeoJSON geometry
 * @param {Object} geometry - GeoJSON geometry object
 * @param {number} featureIndex - Index of the feature (for error reporting)
 * @returns {Object} Validation result
 */
function validateGeometry(geometry, featureIndex) {
  const errors = [];
  const warnings = [];

  if (!geometry || typeof geometry !== 'object') {
    errors.push(`Feature ${featureIndex}: Missing or invalid geometry`);
    return { errors, warnings };
  }

  if (!geometry.type) {
    errors.push(`Feature ${featureIndex}: Geometry missing 'type' field`);
    return { errors, warnings };
  }

  if (!geometry.coordinates) {
    errors.push(`Feature ${featureIndex}: Geometry missing 'coordinates' field`);
    return { errors, warnings };
  }

  const { type, coordinates } = geometry;

  switch (type) {
    case 'Point': {
      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        errors.push(`Feature ${featureIndex}: Point coordinates must be [lon, lat]`);
      } else {
        const [lon, lat] = coordinates;
        const validation = validateCoordinates(lon, lat);
        errors.push(...validation.errors.map(e => `Feature ${featureIndex}: ${e}`));
        warnings.push(...validation.warnings.map(w => `Feature ${featureIndex}: ${w}`));
      }
      break;
    }

    case 'LineString': {
      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        errors.push(`Feature ${featureIndex}: LineString must have at least 2 points`);
      } else {
        coordinates.forEach((coord, i) => {
          if (!Array.isArray(coord) || coord.length < 2) {
            errors.push(`Feature ${featureIndex}: Invalid coordinate at position ${i}`);
          } else {
            const [lon, lat] = coord;
            const validation = validateCoordinates(lon, lat);
            errors.push(...validation.errors.map(e => `Feature ${featureIndex}, point ${i}: ${e}`));
          }
        });
      }
      break;
    }

    case 'Polygon': {
      if (!Array.isArray(coordinates) || coordinates.length < 1) {
        errors.push(`Feature ${featureIndex}: Polygon must have at least one ring`);
      } else {
        coordinates.forEach((ring, ringIndex) => {
          if (!Array.isArray(ring) || ring.length < 4) {
            errors.push(`Feature ${featureIndex}: Polygon ring ${ringIndex} must have at least 4 points`);
          } else {
            // Check if ring is closed
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
              errors.push(`Feature ${featureIndex}: Polygon ring ${ringIndex} is not closed (first and last points must match)`);
            }

            // Validate each coordinate
            ring.forEach((coord, i) => {
              if (!Array.isArray(coord) || coord.length < 2) {
                errors.push(`Feature ${featureIndex}: Invalid coordinate at ring ${ringIndex}, position ${i}`);
              } else {
                const [lon, lat] = coord;
                const validation = validateCoordinates(lon, lat);
                errors.push(...validation.errors.map(e => `Feature ${featureIndex}, ring ${ringIndex}, point ${i}: ${e}`));
              }
            });
          }
        });
      }
      break;
    }

    default:
      warnings.push(`Feature ${featureIndex}: Geometry type '${type}' is not fully supported. Supported types: Point, LineString, Polygon`);
  }

  return { errors, warnings };
}

/**
 * Validate GeoJSON data structure
 * @param {Object} geojson - GeoJSON object to validate
 * @returns {Object} Validation result with errors, warnings, and stats
 */
export function validateGeoJSON(geojson) {
  const errors = [];
  const warnings = [];
  const stats = {
    featureCount: 0,
    pointCount: 0,
    lineCount: 0,
    polygonCount: 0,
    timeRange: { min: null, max: null },
    hasTimestamps: false,
    missingTimestamps: 0
  };

  // Check basic structure
  if (!geojson || typeof geojson !== 'object') {
    errors.push('Data is not a valid object');
    return { valid: false, errors, warnings, stats };
  }

  if (geojson.type !== 'FeatureCollection') {
    errors.push(`Expected type 'FeatureCollection', got '${geojson.type}'`);
    return { valid: false, errors, warnings, stats };
  }

  if (!Array.isArray(geojson.features)) {
    errors.push('FeatureCollection must have a "features" array');
    return { valid: false, errors, warnings, stats };
  }

  if (geojson.features.length === 0) {
    warnings.push('FeatureCollection is empty (no features)');
    return { valid: true, errors, warnings, stats };
  }

  stats.featureCount = geojson.features.length;

  // Validate each feature
  geojson.features.forEach((feature, index) => {
    if (!feature || typeof feature !== 'object') {
      errors.push(`Feature ${index}: Not a valid object`);
      return;
    }

    if (feature.type !== 'Feature') {
      errors.push(`Feature ${index}: Expected type 'Feature', got '${feature.type}'`);
    }

    // Validate geometry
    const geometryValidation = validateGeometry(feature.geometry, index);
    errors.push(...geometryValidation.errors);
    warnings.push(...geometryValidation.warnings);

    // Count geometry types
    if (feature.geometry && feature.geometry.type) {
      switch (feature.geometry.type) {
        case 'Point':
          stats.pointCount++;
          break;
        case 'LineString':
          stats.lineCount++;
          break;
        case 'Polygon':
          stats.polygonCount++;
          break;
      }
    }

    // Check properties
    if (!feature.properties) {
      warnings.push(`Feature ${index}: Missing 'properties' object`);
      feature.properties = {};
    }

    // Check for timestamp
    const timestamp = feature.properties.timestamp;
    if (timestamp === undefined || timestamp === null) {
      stats.missingTimestamps++;
      warnings.push(`Feature ${index}: Missing 'timestamp' property. Feature will not be displayed on timeline.`);
    } else {
      stats.hasTimestamps = true;
      const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();

      if (isNaN(time)) {
        errors.push(`Feature ${index}: Invalid timestamp value: ${timestamp}`);
      } else {
        if (stats.timeRange.min === null || time < stats.timeRange.min) {
          stats.timeRange.min = time;
        }
        if (stats.timeRange.max === null || time > stats.timeRange.max) {
          stats.timeRange.max = time;
        }
      }
    }
  });

  // Check if all features are missing timestamps
  if (stats.missingTimestamps === stats.featureCount) {
    errors.push('No features have valid timestamps. Add a "timestamp" property to each feature.');
  }

  // Calculate time span
  if (stats.timeRange.min !== null && stats.timeRange.max !== null) {
    const spanMs = stats.timeRange.max - stats.timeRange.min;
    const spanDays = spanMs / (1000 * 60 * 60 * 24);
    const spanYears = spanDays / 365.25;

    stats.timeSpan = {
      milliseconds: spanMs,
      days: Math.round(spanDays),
      years: Math.round(spanYears * 10) / 10
    };

    if (spanMs === 0) {
      warnings.push('All features have the same timestamp. Timeline will not be very useful.');
    }
  }

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    stats
  };
}

/**
 * Validate file before processing
 * @param {File} file - File object to validate
 * @returns {Object} Validation result
 */
export function validateFile(file) {
  const errors = [];
  const warnings = [];

  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors, warnings };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit of 10MB`);
  }

  if (file.size > 1024 * 1024) {
    warnings.push(`Large file (${(file.size / 1024 / 1024).toFixed(2)}MB) may take a while to load`);
  }

  // Check file extension
  const validExtensions = ['.json', '.geojson', '.csv'];
  const filename = file.name.toLowerCase();
  const hasValidExtension = validExtensions.some(ext => filename.endsWith(ext));

  if (!hasValidExtension) {
    warnings.push(`Unexpected file extension. Expected: ${validExtensions.join(', ')}`);
  }

  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type
    }
  };
}

/**
 * Generate a validation summary message
 * @param {Object} validation - Validation result
 * @returns {string} Human-readable summary
 */
export function getValidationSummary(validation) {
  const { valid, errors, warnings, stats } = validation;

  if (!valid) {
    return `Validation failed with ${errors.length} error(s):\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...and ${errors.length - 5} more` : ''}`;
  }

  let summary = `✓ Valid GeoJSON with ${stats.featureCount} feature(s)`;

  if (stats.pointCount > 0) summary += `\n  - ${stats.pointCount} point(s)`;
  if (stats.lineCount > 0) summary += `\n  - ${stats.lineCount} line(s)`;
  if (stats.polygonCount > 0) summary += `\n  - ${stats.polygonCount} polygon(s)`;

  if (stats.timeSpan) {
    summary += `\n  - Time span: ${stats.timeSpan.years} years`;
    summary += `\n  - Range: ${new Date(stats.timeRange.min).toLocaleDateString()} to ${new Date(stats.timeRange.max).toLocaleDateString()}`;
  }

  if (warnings.length > 0) {
    summary += `\n\n⚠ ${warnings.length} warning(s):\n${warnings.slice(0, 3).join('\n')}${warnings.length > 3 ? `\n...and ${warnings.length - 3} more` : ''}`;
  }

  return summary;
}
