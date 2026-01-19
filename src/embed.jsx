import React from 'react';
import { createRoot } from 'react-dom/client';
import TimeSliderMap from './components/TimeSliderMap';
import './index.css';

class TimeSliderMapElement extends HTMLElement {
  constructor() {
    super();
    this.root = null;
  }

  connectedCallback() {
    const mountPoint = document.createElement('div');
    this.appendChild(mountPoint);

    // Parse attributes
    const dataUrl = this.getAttribute('data-url');
    const dataJson = this.getAttribute('data-json');
    const center = this.getAttribute('center') || '0,0';
    const zoom = this.getAttribute('zoom') || '2';
    const timeField = this.getAttribute('time-field') || 'timestamp';

    const [lng, lat] = center.split(',').map(Number);

    // Load data
    if (dataUrl) {
      fetch(dataUrl)
        .then(res => res.json())
        .then(data => {
          this.renderMap(mountPoint, data, [lng, lat], Number(zoom), timeField);
        })
        .catch(err => {
          console.error('Failed to load map data:', err);
          mountPoint.innerHTML = '<p style="color: red;">Failed to load map data</p>';
        });
    } else if (dataJson) {
      try {
        const data = JSON.parse(dataJson);
        this.renderMap(mountPoint, data, [lng, lat], Number(zoom), timeField);
      } catch (err) {
        console.error('Failed to parse map data:', err);
        mountPoint.innerHTML = '<p style="color: red;">Invalid GeoJSON data</p>';
      }
    } else {
      mountPoint.innerHTML = '<p style="color: red;">Please provide data-url or data-json attribute</p>';
    }
  }

  renderMap(mountPoint, data, center, zoom, timeField) {
    this.root = createRoot(mountPoint);
    this.root.render(
      <TimeSliderMap
        data={data}
        timeField={timeField}
        initialCenter={center}
        initialZoom={zoom}
      />
    );
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }
}

// Register the custom element
customElements.define('time-slider-map', TimeSliderMapElement);
