import { useState } from 'react';
import './Legend.css';

const Legend = ({ data, colorProperty = 'song' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!data || !data.features || data.features.length === 0) {
    return null;
  }

  // Count frequency of each value
  const valueCounts = {};
  data.features.forEach(feature => {
    const value = feature.properties[colorProperty];
    if (value) {
      valueCounts[value] = (valueCounts[value] || 0) + 1;
    }
  });

  if (Object.keys(valueCounts).length === 0) {
    return null;
  }

  // Sort by frequency (most common first)
  const sortedValues = Object.entries(valueCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  // Priority color assignments for specific songs (must match TimeSliderMap)
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

  let remainingColorIndex = 0;
  const legendItems = sortedValues.map((value) => {
    let color;
    if (priorityColors[value]) {
      color = priorityColors[value];
    } else {
      color = remainingColors[remainingColorIndex % remainingColors.length];
      remainingColorIndex++;
    }
    return { value, color };
  });

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
