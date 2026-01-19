import { useState } from 'react';
import './Legend.css';

const Legend = ({ data, colorProperty = 'song' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!data || !data.features || data.features.length === 0) {
    return null;
  }

  // Extract unique values for the color property
  const uniqueValues = new Set();
  data.features.forEach(feature => {
    const value = feature.properties[colorProperty];
    if (value) uniqueValues.add(value);
  });

  if (uniqueValues.size === 0) {
    return null;
  }

  // Color palette (must match TimeSliderMap)
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

  const legendItems = Array.from(uniqueValues)
    .sort()
    .map((value, index) => ({
      value,
      color: colors[index % colors.length]
    }));

  return (
    <div className={`legend ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="legend-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <span className="legend-title">
          {colorProperty.charAt(0).toUpperCase() + colorProperty.slice(1)}
        </span>
        <button className="legend-toggle">
          {isCollapsed ? '▼' : '▲'}
        </button>
      </div>
      {!isCollapsed && (
        <div className="legend-items">
          {legendItems.map(item => (
            <div key={item.value} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: item.color }}
              />
              <span className="legend-label">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Legend;
