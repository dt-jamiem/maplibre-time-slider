import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './TimeSliderMap.css';
import Legend from './Legend';

const TimeSliderMap = ({ data, timeField = 'timestamp', initialCenter = [0, 0], initialZoom = 2 }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [timeRange, setTimeRange] = useState({ min: 0, max: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playIntervalRef = useRef(null);

  // Extract time range from data
  useEffect(() => {
    if (!data || !data.features || data.features.length === 0) return;

    const timestamps = data.features
      .map(f => f.properties[timeField])
      .filter(t => t !== undefined)
      .sort((a, b) => a - b);

    if (timestamps.length > 0) {
      const dataMin = timestamps[0];
      const dataMax = timestamps[timestamps.length - 1];

      // Start one month before the first data entry
      const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      const startTime = dataMin - oneMonth;

      setTimeRange({ min: startTime, max: dataMax });
      setCurrentTime(startTime);
    }
  }, [data, timeField]);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'carto-light': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, © CARTO'
          }
        },
        layers: [
          {
            id: 'carto-light-layer',
            type: 'raster',
            source: 'carto-light',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: initialCenter,
      zoom: initialZoom
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialCenter, initialZoom]);

  // Add/update data source
  useEffect(() => {
    if (!map.current || !data) return;

    const mapInstance = map.current;

    // Create a color map based on unique values in the data
    const createColorMap = (geojson, propertyName) => {
      // Count frequency of each value
      const valueCounts = {};
      geojson.features.forEach(feature => {
        const value = feature.properties[propertyName];
        if (value) {
          valueCounts[value] = (valueCounts[value] || 0) + 1;
        }
      });

      // Sort by frequency (most common first)
      const sortedValues = Object.entries(valueCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

      // Priority color assignments for specific songs
      const priorityColors = {
        'The Witch': '#10b981',                        // emerald green
        'Psycho': '#8b5cf6',                           // purple
        "You've Got Your Head On Backwards": '#ef4444', // red
        "Don't Be Afraid of the Dark": '#f97316'       // orange
      };

      // Remaining colors for other songs
      const remainingColors = [
        '#3b82f6', // blue
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#84cc16', // lime
        '#f59e0b', // amber
        '#6366f1', // indigo
        '#14b8a6', // teal
        '#a855f7'  // lighter purple
      ];

      const colorMap = {};
      let remainingColorIndex = 0;

      sortedValues.forEach((value) => {
        if (priorityColors[value]) {
          colorMap[value] = priorityColors[value];
        } else {
          colorMap[value] = remainingColors[remainingColorIndex % remainingColors.length];
          remainingColorIndex++;
        }
      });

      return colorMap;
    };

    mapInstance.on('load', () => {
      if (!mapInstance.getSource('time-data')) {
        mapInstance.addSource('time-data', {
          type: 'geojson',
          data: filterDataByTime(data, currentTime, timeField)
        });

        // Detect if data has a categorical property to color by
        const firstFeature = data.features[0];
        let colorProperty = null;
        let colorMap = null;

        // Check for common categorical properties
        const categoricalFields = ['song', 'name', 'category', 'type', 'class'];
        for (const field of categoricalFields) {
          if (firstFeature?.properties?.[field]) {
            colorProperty = field;
            colorMap = createColorMap(data, field);
            break;
          }
        }

        // Create color expression for data-driven styling
        let circleColorExpression = '#3b82f6'; // default color
        if (colorProperty && colorMap) {
          circleColorExpression = [
            'match',
            ['get', colorProperty],
            ...Object.entries(colorMap).flat(),
            '#3b82f6' // fallback color
          ];
        }

        // Parse chart position for size scaling
        // Converts "#1" to 1, "#18" to 18, etc.
        const parseChartPosition = ['to-number',
          ['slice', ['get', 'chart_position'], 1]
        ];

        // Create size expression based on chart position
        // Better positions (lower numbers) = bigger circles
        // #1-5: 16px, #6-10: 12px, #11-20: 9px, #21+: 6px
        const circleSizeExpression = [
          'case',
          ['has', 'chart_position'],
          [
            'interpolate',
            ['linear'],
            parseChartPosition,
            1, 16,    // #1 = 16px
            5, 14,    // #5 = 14px
            10, 11,   // #10 = 11px
            20, 8,    // #20 = 8px
            50, 6     // #50 = 6px
          ],
          8 // default size if no chart_position
        ];

        // Create stroke width expression based on chart position
        // Top hits get thicker borders
        const strokeWidthExpression = [
          'case',
          ['has', 'chart_position'],
          [
            'interpolate',
            ['linear'],
            parseChartPosition,
            1, 3,     // #1 = 3px stroke
            5, 2.5,   // #5 = 2.5px stroke
            20, 2,    // #20 = 2px stroke
            50, 1.5   // #50 = 1.5px stroke
          ],
          2 // default stroke width
        ];

        // Add layers for different geometry types
        mapInstance.addLayer({
          id: 'points',
          type: 'circle',
          source: 'time-data',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': circleSizeExpression,
            'circle-color': circleColorExpression,
            'circle-stroke-width': strokeWidthExpression,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.85  // Will be updated dynamically for fade effect
          }
        });

        // Detect the city/location field name
        let cityField = null;
        const locationFields = ['city', 'location', 'station', 'place', 'name'];
        for (const field of locationFields) {
          if (firstFeature?.properties?.[field] && field !== colorProperty) {
            cityField = field;
            break;
          }
        }

        // Create a separate source for all cities (not filtered by time)
        if (cityField) {
          // Extract unique cities with their coordinates and count occurrences
          const cityMap = new Map();
          const cityCounts = new Map();

          data.features.forEach(feature => {
            if (feature.geometry.type === 'Point') {
              const cityName = feature.properties[cityField];
              if (cityName) {
                cityCounts.set(cityName, (cityCounts.get(cityName) || 0) + 1);

                if (!cityMap.has(cityName)) {
                  cityMap.set(cityName, {
                    type: 'Feature',
                    geometry: feature.geometry,
                    properties: {
                      [cityField]: cityName,
                      dataPointCount: 0  // Will be updated below
                    }
                  });
                }
              }
            }
          });

          // Update counts and calculate max for priority scaling
          const maxCount = Math.max(...cityCounts.values());
          cityMap.forEach((feature, cityName) => {
            const count = cityCounts.get(cityName) || 0;
            feature.properties.dataPointCount = count;
            // Priority: higher count = higher priority (inverse of count for sort-key)
            feature.properties.priority = maxCount - count;
          });

          const allCitiesData = {
            type: 'FeatureCollection',
            features: Array.from(cityMap.values())
          };

          // Add source for all cities
          mapInstance.addSource('all-cities', {
            type: 'geojson',
            data: allCitiesData
          });

          // Add city labels in dark font with priority sorting
          mapInstance.addLayer({
            id: 'city-labels',
            type: 'symbol',
            source: 'all-cities',
            layout: {
              'text-field': ['get', cityField],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['get', 'dataPointCount'],
                1, 12,     // Cities with 1 data point: 12px
                10, 13,    // Cities with 10 data points: 13px
                20, 14,    // Cities with 20+ data points: 14px
                50, 15     // Cities with 50+ data points: 15px (like Seattle/Tacoma)
              ],
              'text-offset': [0, 1.5],
              'text-anchor': 'top',
              'text-allow-overlap': false,
              'text-optional': false,  // Don't hide text when icon is hidden
              'symbol-sort-key': ['get', 'priority']  // Lower priority number = displayed first
            },
            paint: {
              'text-color': '#1f2937',  // Dark gray, almost black
              'text-halo-color': '#ffffff',
              'text-halo-width': 2,
              'text-halo-blur': 1
            }
          });
        }

        mapInstance.addLayer({
          id: 'lines',
          type: 'line',
          source: 'time-data',
          filter: ['==', '$type', 'LineString'],
          paint: {
            'line-color': '#3b82f6',
            'line-width': 3
          }
        });

        mapInstance.addLayer({
          id: 'polygons',
          type: 'fill',
          source: 'time-data',
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.5
          }
        });

        mapInstance.addLayer({
          id: 'polygon-outline',
          type: 'line',
          source: 'time-data',
          filter: ['==', '$type', 'Polygon'],
          paint: {
            'line-color': '#1e40af',
            'line-width': 2
          }
        });

        // Add popup on click
        const interactiveLayers = cityField
          ? ['points', 'city-labels', 'lines', 'polygons']
          : ['points', 'lines', 'polygons'];

        mapInstance.on('click', interactiveLayers, (e) => {
          if (e.features.length > 0) {
            const feature = e.features[0];
            const properties = feature.properties;

            const html = Object.entries(properties)
              .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
              .join('<br>');

            new maplibregl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(html)
              .addTo(mapInstance);
          }
        });

        // Change cursor on hover
        mapInstance.on('mouseenter', interactiveLayers, () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });

        mapInstance.on('mouseleave', interactiveLayers, () => {
          mapInstance.getCanvas().style.cursor = '';
        });
      }
    });
  }, [data, timeField]);

  // Update data when time changes
  useEffect(() => {
    if (!map.current || !data) return;

    const mapInstance = map.current;
    const source = mapInstance.getSource('time-data');

    if (source) {
      source.setData(filterDataByTime(data, currentTime, timeField));

      // Update opacity to create fade effect for older entries
      // Calculate the time window for fading (e.g., last 20% of visible time range)
      const fadeWindow = (currentTime - timeRange.min) * 0.3; // Fade over last 30% of time range
      const fadeStartTime = currentTime - fadeWindow;

      // Only apply fade if we have a reasonable time range
      if (fadeWindow > 0 && mapInstance.getLayer('points')) {
        mapInstance.setPaintProperty('points', 'circle-opacity', [
          'interpolate',
          ['linear'],
          ['get', timeField],
          fadeStartTime, 0.4,  // Older entries fade to 40%
          currentTime, 0.85    // Most recent entries at 85%
        ]);
      }
    }
  }, [currentTime, data, timeField, timeRange]);

  // Play/pause functionality
  useEffect(() => {
    if (isPlaying) {
      const step = (timeRange.max - timeRange.min) / 100;
      playIntervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= timeRange.max) {
            setIsPlaying(false);
            return timeRange.min;
          }
          return prev + step;
        });
      }, 100);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, timeRange]);

  const filterDataByTime = (geojson, time, field) => {
    return {
      ...geojson,
      features: geojson.features.filter(f => f.properties[field] <= time)
    };
  };

  const formatTime = (timestamp) => {
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleDateString();
    }
    return timestamp;
  };

  const stepMonth = (direction) => {
    const currentDate = new Date(currentTime);
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);

    const newTime = newDate.getTime();
    if (newTime >= timeRange.min && newTime <= timeRange.max) {
      setCurrentTime(newTime);
      setIsPlaying(false);
    }
  };

  return (
    <div className={`time-slider-map ${isFullscreen ? 'fullscreen' : ''}`}>
      <div ref={mapContainer} className="map-container" />
      <Legend data={data} colorProperty="song" />

      {isFullscreen && (
        <button
          onClick={() => setIsFullscreen(false)}
          className="fullscreen-exit"
          title="Exit Fullscreen"
        >
          ✕
        </button>
      )}

      <div className="time-controls">
        <button
          onClick={() => stepMonth(-1)}
          className="step-button"
          disabled={currentTime <= timeRange.min}
          title="Previous Month"
        >
          ◀
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="play-button"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          onClick={() => stepMonth(1)}
          className="step-button"
          disabled={currentTime >= timeRange.max}
          title="Next Month"
        >
          ▶
        </button>

        <div className="slider-container">
          <input
            type="range"
            min={timeRange.min}
            max={timeRange.max}
            value={currentTime}
            onChange={(e) => {
              setCurrentTime(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="time-slider"
          />
          <div className="time-display">
            {formatTime(currentTime)}
          </div>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="fullscreen-button"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? '⊖' : '⊕'}
        </button>
      </div>
    </div>
  );
};

export default TimeSliderMap;
