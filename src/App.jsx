import { useState } from 'react'
import TimeSliderMap from './components/TimeSliderMap'
import FileUpload from './components/FileUpload'
import { citiesOverTime, railroadExpansion, statehood } from './data/sampleData'
import './App.css'

function App() {
  const [selectedDataset, setSelectedDataset] = useState('cities')
  const [customData, setCustomData] = useState(null)
  const [customDataInfo, setCustomDataInfo] = useState(null)
  const [showUpload, setShowUpload] = useState(false)

  const datasets = {
    cities: {
      data: citiesOverTime,
      center: [-95, 37],
      zoom: 3.5,
      title: 'American Cities Founded Over Time'
    },
    railroads: {
      data: railroadExpansion,
      center: [-95, 37],
      zoom: 3.5,
      title: 'Railroad Expansion'
    },
    states: {
      data: statehood,
      center: [-110, 40],
      zoom: 4,
      title: 'Western States Admitted to Union'
    }
  }

  const calculateCenter = (geojson) => {
    if (!geojson.features || geojson.features.length === 0) return [0, 0]

    let totalLon = 0
    let totalLat = 0
    let count = 0

    geojson.features.forEach(feature => {
      if (feature.geometry.type === 'Point') {
        totalLon += feature.geometry.coordinates[0]
        totalLat += feature.geometry.coordinates[1]
        count++
      }
    })

    return count > 0 ? [totalLon / count, totalLat / count] : [0, 0]
  }

  const currentDataset = customData
    ? {
        data: customData,
        center: customDataInfo?.stats?.timeRange
          ? calculateCenter(customData)
          : [0, 0],
        zoom: 8, // Start zoomed in - will auto-adjust as data appears
        title: customDataInfo?.filename || 'Custom Data'
      }
    : (datasets[selectedDataset] || datasets['cities'])

  const handleDataLoaded = (geojson, info) => {
    console.log('Data loaded:', info);
    setCustomData(geojson)
    setCustomDataInfo(info)
    setShowUpload(false)
    setSelectedDataset(null)
  }

  const handleError = (error) => {
    console.error('Upload error:', error)
  }

  const selectPresetDataset = (dataset) => {
    setSelectedDataset(dataset)
    setCustomData(null)
    setCustomDataInfo(null)
    setShowUpload(false)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>MapLibre Time Slider Demo</h1>
        <p>Visualize geographic data changes over time</p>
      </header>

      <div className="dataset-selector">
        <button
          className={selectedDataset === 'cities' && !customData ? 'active' : ''}
          onClick={() => selectPresetDataset('cities')}
        >
          Cities
        </button>
        <button
          className={selectedDataset === 'railroads' && !customData ? 'active' : ''}
          onClick={() => selectPresetDataset('railroads')}
        >
          Railroads
        </button>
        <button
          className={selectedDataset === 'states' && !customData ? 'active' : ''}
          onClick={() => selectPresetDataset('states')}
        >
          States
        </button>
        <button
          className={customData ? 'active' : ''}
          onClick={() => setShowUpload(!showUpload)}
        >
          {customData ? '✓ Custom Data' : '📤 Upload Data'}
        </button>
      </div>

      {showUpload ? (
        <div className="upload-section">
          <h2>Upload Your Data</h2>
          <FileUpload
            onDataLoaded={handleDataLoaded}
            onError={handleError}
          />
        </div>
      ) : (
        <>
          <div className="map-section">
            <h2>{currentDataset.title}</h2>
            {customDataInfo && (
              <div className="dataset-info">
                <span>
                  {customDataInfo.stats.featureCount} features
                  {customDataInfo.stats.timeSpan && ` • ${customDataInfo.stats.timeSpan.years} years`}
                </span>
              </div>
            )}
            <TimeSliderMap
              key={customData ? 'custom' : selectedDataset}
              data={currentDataset.data}
              timeField="timestamp"
              initialCenter={currentDataset.center}
              initialZoom={currentDataset.zoom}
            />
          </div>

          <div className="info-section">
            <h3>Features</h3>
            <ul>
              <li>Interactive time slider to scrub through historical data</li>
              <li>Play/pause animation to watch changes unfold</li>
              <li>Click on map features to see details</li>
              <li>Full pan and zoom controls</li>
              <li>Upload your own CSV, JSON, or GeoJSON files</li>
              <li>Embeddable in any web page or blog post</li>
            </ul>

            <h3>How to Use</h3>
            <ol>
              <li>Select a preset dataset or upload your own data</li>
              <li>Use the time slider to move through time</li>
              <li>Click the play button to animate the visualization</li>
              <li>Click on any feature for more information</li>
            </ol>
          </div>
        </>
      )}
    </div>
  )
}

export default App
