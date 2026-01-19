# MapLibre Time Slider

An interactive map component with a time slider for visualizing geographic data changes over time. Built with React, MapLibre GL JS, and designed to be easily embeddable in any website or blog post.

## Features

### Core Functionality
- **Interactive time slider** to scrub through temporal data
- **Play/pause animation** to watch changes unfold automatically
- **Dynamic zoom** - Map automatically adjusts to show all visible data, creating cinematic reveal effects
- **Smart color coding** - Automatically assigns distinct colors to categorical data (songs, names, categories)
- **Interactive legend** - Collapsible legend showing color mappings for easy reference
- **Data-driven sizing** - Visual importance based on data values (e.g., chart positions)
- **Temporal fade effect** - Older entries gradually fade to 40% opacity while recent ones stay bright
- **Cinematic 4:3 aspect ratio** - Wider map format perfect for showcasing geographic spread
- **Support for multiple geometry types**: Points, LineStrings, and Polygons
- **Click on features** to view detailed information in popups
- **Full map controls**: Pan, zoom, and navigation
- **Responsive design** that works on all screen sizes

### Data Import & Management
- **Drag-and-drop file upload** with real-time validation
- **Multiple format support**: CSV, JSON, and GeoJSON
- **Automatic format detection** and conversion
- **Data validation** with helpful error messages and warnings
- **Example datasets** included for quick testing
- **6 ready-to-use CSV templates** for different use cases

### Developer Friendly
- **Embeddable as a web component**
- **Comprehensive documentation** with examples
- **Data transformation utilities** for converting your data
- **Flexible field name detection** (accepts lat/latitude, lon/lng/longitude, etc.)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the demo application.

### Build

```bash
npm run build
```

This creates both the main application and the embeddable widget in the `dist` folder.

## Quick Start: Importing Your Data

### Option 1: Upload via UI (Easiest)
1. Run `npm run dev`
2. Open http://localhost:5173
3. Click "📤 Upload Data"
4. Drag and drop your CSV, JSON, or GeoJSON file
5. Watch your data appear on the map!

### Option 2: Use a Template
Choose from 6 ready-to-use templates in `public/templates/`:
- `template_blank.csv` - Empty template to start from scratch
- `template_with_examples.csv` - Sample data to learn the format
- `template_historical_events.csv` - For historical timelines
- `template_business_expansion.csv` - Track business growth
- `template_personal_travel.csv` - Travel logs and journeys
- `template_project_timeline.csv` - Project milestones

### Option 3: Use as a React Component

```jsx
import TimeSliderMap from './components/TimeSliderMap';

const myData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-74.006, 40.7128]
      },
      properties: {
        name: 'New York',
        timestamp: new Date('1624-01-01').getTime(),
        description: 'Founded as New Amsterdam'
      }
    }
  ]
};

function MyApp() {
  return (
    <TimeSliderMap
      data={myData}
      timeField="timestamp"
      initialCenter={[-95, 37]}
      initialZoom={3.5}
    />
  );
}
```

## Supported Data Formats

### CSV Format
```csv
date,latitude,longitude,name,description
2021-01-15,40.7128,-74.0060,New York,An event here
2021-06-22,37.7749,-122.4194,San Francisco,Another event
```

**Required columns:** `date` (or `timestamp`), `latitude` (or `lat`), `longitude` (or `lon`/`lng`)
**Optional columns:** Any additional data you want (shown in popups)

### Simple JSON Format
```json
[
  {
    "date": "2021-01-15",
    "lat": 40.7128,
    "lon": -74.0060,
    "name": "New York",
    "type": "point"
  }
]
```

### GeoJSON Format (Standard)
Standard GeoJSON FeatureCollection with a `timestamp` property in each feature.

📚 **See [DATA_FORMAT_GUIDE.md](DATA_FORMAT_GUIDE.md) for complete format specifications**
📋 **See [CSV_TEMPLATE_GUIDE.md](CSV_TEMPLATE_GUIDE.md) for template quick reference**
📖 **See [IMPORT_GUIDE.md](IMPORT_GUIDE.md) for detailed import instructions**

## Embedding in a Blog Post or Website

After building the project, you can embed the map as a custom HTML element.

### Quick Start

1. **Build the embeddable version:**
   ```bash
   npm run build
   ```

2. **Host the files** (see [WORDPRESS_EMBED_GUIDE.md](WORDPRESS_EMBED_GUIDE.md) for detailed hosting options)

3. **Add to your webpage:**
   ```html
   <script src="https://your-domain.com/embed.js"></script>

   <time-slider-map
     data-url="https://your-domain.com/data.geojson"
     center="-95,37"
     zoom="3.5"
     time-field="timestamp"
   ></time-slider-map>
   ```

### Embedding in WordPress

See the comprehensive **[WordPress Embedding Guide](WORDPRESS_EMBED_GUIDE.md)** for step-by-step instructions including:
- Using GitHub Pages for free hosting
- Adding Custom HTML blocks in WordPress
- Troubleshooting common issues
- Converting CSV data to GeoJSON

### Attributes

- `data-url`: URL to a GeoJSON file
- `data-json`: Inline GeoJSON string (alternative to data-url)
- `center`: Map center as "longitude,latitude" (default: "0,0")
- `zoom`: Initial zoom level (default: "2")
- `time-field`: Property name containing the timestamp (default: "timestamp")

### Example: The Sonics Timeline

```html
<script src="https://your-domain.com/embed.js"></script>

<time-slider-map
  data-url="https://your-domain.com/sonics.geojson"
  center="-122,45.5"
  zoom="5.5"
  time-field="timestamp"
></time-slider-map>
```

## Data Transformation Tools

### Built-in Converters
Located in `src/utils/dataConverters.js`:
- **`csvToGeoJSON()`** - Convert CSV to GeoJSON format
- **`simpleJSONToGeoJSON()`** - Convert simple JSON to GeoJSON
- **`autoConvertToGeoJSON()`** - Auto-detect and convert any format
- **`parseTimestamp()`** - Parse various date/time formats

### Built-in Validators
Located in `src/utils/dataValidator.js`:
- **`validateFile()`** - Pre-upload file validation
- **`validateGeoJSON()`** - Complete GeoJSON structure validation
- **`validateCoordinates()`** - Check coordinate ranges
- **`getValidationSummary()`** - Human-readable validation reports

### Example Data Transformation Script
See `transform_sonics_data.js` for an example of converting wide-format CSV (with dates as columns) to the required format.

## Data Format

### Timestamp Formats Accepted
- Unix timestamp (milliseconds): `1609459200000`
- ISO date string: `"2021-01-01"` or `"2021-01-01T12:00:00Z"`
- Year only: `2021` (converted to January 1st)
- Date string: `"YYYY-MM-DD"`

### Required GeoJSON Structure
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
        "timestamp": 1234567890000,
        "name": "Example Location",
        "description": "Any other properties you want to display"
      }
    }
  ]
}
```

## Advanced Visualization Features

### Automatic Color Coding
The map automatically detects categorical properties in your data and assigns distinct colors to each unique value. It looks for common field names like:
- `song` - Perfect for music chart data
- `name` - For named entities or categories
- `category`, `type`, `class` - For general categorization

**Intelligent Frequency-Based Assignment:**
- The system counts how often each value appears in your dataset
- Most frequent values get priority colors (strong, distinctive hues)
- Less frequent values receive automatic assignments from remaining colors
- For the Sonics dataset: The Witch (most charted) gets green, Psycho gets purple, etc.

An interactive legend appears in the top-right corner showing the color mapping, sorted by frequency with the most common items at the top.

### Data-Driven Sizing
If your data includes a `chart_position` field (e.g., "#1", "#18", "#50"), the map automatically scales point sizes and border widths to show visual importance:
- **Top positions** (e.g., #1-5): Large circles (14-16px) with thick borders (2.5-3px)
- **Mid-range** (e.g., #10-20): Medium circles (8-11px) with standard borders (2px)
- **Lower positions** (e.g., #50+): Smaller circles (6px) with thin borders (1.5px)

This makes it immediately obvious which data points are most significant. The sizing interpolates smoothly between positions for natural-looking visualizations.

### Temporal Fade Effect
As time progresses, older data points gradually fade to create a beautiful "trailing" effect that emphasizes recent data while maintaining historical context:
- **Recent entries**: Remain at 85% opacity (bright and prominent)
- **Older entries**: Gradually fade to 40% opacity (subtle but visible)
- **Fade window**: Automatically calculated based on the visible time range (last 30%)
- **Smooth interpolation**: Linear fade creates natural-looking transitions

When you play the animation, you'll see new entries appear brightly while older ones fade into the background. This creates a dynamic visualization where you can watch patterns emerge over time while maintaining awareness of the full historical context.

### Dynamic Zoom
The map intelligently adjusts its zoom level and center as data appears over time, creating a cinematic storytelling effect:
- **Starts zoomed in** on the initial data region (e.g., Tacoma/Seattle for Sonics data)
- **Automatically expands view** as new data points appear in different locations
- **Smooth 1-second transitions** using MapLibre's fitBounds with easing
- **Smart padding** to account for legend and controls
- **Maximum zoom limit** to maintain geographic context (level 10)

This creates a natural reveal effect where viewers watch the geographic scope expand as the timeline progresses, making patterns of spread and diffusion immediately visible.

### Example: Music Chart Visualization
The included Sonics timeline dataset demonstrates all four visual dimensions perfectly:
- **Color** shows WHAT charted (each song has its own color from the legend)
- **Size** shows HOW WELL it charted (#1 hits are large, #50 is small)
- **Opacity** shows HOW RECENT (bright = current, faded = older)
- **Zoom** shows WHERE the action is (starts tight on Tacoma, expands to show regional spread)
- **Combined effect**: Watch The Witch dominate the Pacific Northwest, starting in Seattle/Tacoma and spreading to California, with the map cinematically adjusting to reveal the full geographic impact

## Example Use Cases

- **Historical city development** - Track urban growth over centuries
- **Transportation network expansion** - Visualize railroad, highway, or transit development
- **Territory and boundary changes** - Show political or administrative changes
- **Environmental changes** - Track deforestation, urbanization, or climate impacts
- **Disease spread visualization** - Map epidemic progression
- **Migration patterns** - Show population movements over time
- **Event timelines** - Plot historical events geographically
- **Business expansion** - Track store openings, market penetration
- **Travel logs** - Visualize personal or historical journeys
- **Music chart history** - Track song popularity across cities (like The Sonics example!)

## Project Structure

```
maplibre-time-slider/
├── src/
│   ├── components/
│   │   ├── TimeSliderMap.jsx      # Main map component
│   │   ├── TimeSliderMap.css
│   │   ├── Legend.jsx             # Interactive color legend
│   │   ├── Legend.css
│   │   ├── FileUpload.jsx         # File upload with drag-and-drop
│   │   └── FileUpload.css
│   ├── utils/
│   │   ├── dataConverters.js      # CSV/JSON to GeoJSON converters
│   │   └── dataValidator.js       # Data validation utilities
│   ├── data/
│   │   └── sampleData.js          # Built-in example datasets
│   ├── App.jsx                    # Main application
│   └── main.jsx
├── public/
│   ├── examples/                  # Example data files
│   │   ├── city_founding.csv
│   │   ├── explorer_routes.json
│   │   ├── world_events.geojson
│   │   └── sonics_timeline_transformed.csv
│   └── templates/                 # CSV templates for users
│       ├── template_blank.csv
│       ├── template_with_examples.csv
│       ├── template_historical_events.csv
│       ├── template_business_expansion.csv
│       ├── template_personal_travel.csv
│       └── template_project_timeline.csv
├── transform_sonics_data.js       # Example data transformation script
├── DATA_FORMAT_GUIDE.md          # Complete format specifications
├── CSV_TEMPLATE_GUIDE.md         # Template quick reference
├── IMPORT_GUIDE.md               # Import instructions
└── README.md                      # This file
```

## Technology Stack

- **React**: UI framework
- **MapLibre GL JS**: Open-source mapping library
- **Vite**: Build tool and dev server
- **Web Components**: For embeddability

## License

MIT

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.
