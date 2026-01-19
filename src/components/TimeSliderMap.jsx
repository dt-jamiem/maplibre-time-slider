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
  const playIntervalRef = useRef(null);

  // Extract time range from data
  useEffect(() => {
    if (!data || !data.features || data.features.length === 0) return;

    const timestamps = data.features
      .map(f => f.properties[timeField])
      .filter(t => t !== undefined)
      .sort((a, b) => a - b);

    if (timestamps.length > 0) {
      const min = timestamps[0];
      const max = timestamps[timestamps.length - 1];
      setTimeRange({ min, max });
      setCurrentTime(min);
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
      const uniqueValues = new Set();
      geojson.features.forEach(feature => {
        const value = feature.properties[propertyName];
        if (value) uniqueValues.add(value);
      });

      // Color palette - vibrant and distinguishable colors
      const colors = [
        '#ef4444', // red
        '#f59e0b', // amber
        '#10b981', // emerald
        '#3b82f6', // blue
        '#8b5cf6', // violet
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#84cc16', // lime
        '#f97316', // orange
        '#6366f1', // indigo
        '#14b8a6', // teal
        '#a855f7'  // purple
      ];

      const colorMap = {};
      Array.from(uniqueValues).forEach((value, index) => {
        colorMap[value] = colors[index % colors.length];
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
            'circle-opacity': 0.85
          }
        });

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
        mapInstance.on('click', ['points', 'lines', 'polygons'], (e) => {
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
        mapInstance.on('mouseenter', ['points', 'lines', 'polygons'], () => {
          mapInstance.getCanvas().style.cursor = 'pointer';
        });

        mapInstance.on('mouseleave', ['points', 'lines', 'polygons'], () => {
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
    }
  }, [currentTime, data, timeField]);

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

  return (
    <div className="time-slider-map">
      <div ref={mapContainer} className="map-container" />
      <Legend data={data} colorProperty="song" />

      <div className="time-controls">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="play-button"
        >
          {isPlaying ? '⏸' : '▶'}
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
      </div>
    </div>
  );
};

export default TimeSliderMap;
