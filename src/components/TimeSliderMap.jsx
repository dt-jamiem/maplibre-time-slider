import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './TimeSliderMap.css';

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

    mapInstance.on('load', () => {
      if (!mapInstance.getSource('time-data')) {
        mapInstance.addSource('time-data', {
          type: 'geojson',
          data: filterDataByTime(data, currentTime, timeField)
        });

        // Add layers for different geometry types
        mapInstance.addLayer({
          id: 'points',
          type: 'circle',
          source: 'time-data',
          filter: ['==', '$type', 'Point'],
          paint: {
            'circle-radius': 6,
            'circle-color': '#3b82f6',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
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
