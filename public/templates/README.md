# CSV Templates for MapLibre Time Slider

This folder contains ready-to-use CSV templates for different use cases. Download, fill in with your data, and upload to the map!

## 📋 Available Templates

### 1. **template_blank.csv**
Empty template with just the basic required columns.

**Best for:** Starting from scratch with your own data structure

**Columns:**
- `date` - Required
- `latitude` - Required
- `longitude` - Required
- `name` - Optional
- `description` - Optional
- `category` - Optional

---

### 2. **template_with_examples.csv**
Basic template with sample data showing the format.

**Best for:** Understanding the format before adding your data

**Columns:**
- `date` - When the event occurred
- `latitude` - Latitude in decimal degrees
- `longitude` - Longitude in decimal degrees
- `name` - Name of location/event
- `description` - Details about what happened
- `category` - Type/classification of event

---

### 3. **template_historical_events.csv**
Template for historical events with significance ratings.

**Best for:**
- Historical timelines
- Educational projects
- Documenting important events

**Columns:**
- `date` - Event date
- `latitude` - Event location latitude
- `longitude` - Event location longitude
- `name` - Event name
- `description` - What happened
- `category` - Type (Political, Military, Cultural, etc.)
- `significance` - Importance level (Low, Medium, High, Critical)

**Example data:** US historical events from Declaration of Independence to Moon Landing

---

### 4. **template_business_expansion.csv**
Template for tracking business/store locations over time.

**Best for:**
- Company growth visualization
- Retail expansion tracking
- Franchise development
- Market penetration analysis

**Columns:**
- `date` - Opening date
- `latitude` - Location latitude
- `longitude` - Location longitude
- `name` - Store/office name
- `description` - Opening details
- `store_type` - Type (Headquarters, Branch, Store, Warehouse, etc.)
- `employees` - Number of employees
- `revenue` - Annual revenue (optional)

**Example data:** Multi-year business expansion across US cities

---

### 5. **template_personal_travel.csv**
Template for documenting travel history and trips.

**Best for:**
- Personal travel maps
- Travel blogs
- Trip planning
- Vacation memories

**Columns:**
- `date` - Visit date
- `latitude` - Destination latitude
- `longitude` - Destination longitude
- `name` - City/place name
- `description` - What you did/saw
- `country` - Country name
- `days_stayed` - Length of visit

**Example data:** World travel itinerary

---

### 6. **template_project_timeline.csv**
Template for project milestones and construction phases.

**Best for:**
- Construction projects
- Multi-phase developments
- Infrastructure projects
- Project management visualization

**Columns:**
- `date` - Milestone date
- `latitude` - Project location latitude
- `longitude` - Project location longitude
- `name` - Milestone name
- `description` - Milestone details
- `phase` - Project phase (Planning, Construction, Completion, etc.)
- `status` - Current status (Planned, In Progress, Completed)
- `budget` - Budget allocated for this milestone

**Example data:** Building construction timeline

---

## 🚀 How to Use These Templates

### Step 1: Choose a Template
Pick the template that best matches your use case, or start with the blank template.

### Step 2: Download/Copy
- Open the template file in a text editor, or
- Right-click → "Open with Excel/Google Sheets"

### Step 3: Edit Your Data
- **Keep the header row** (first line with column names)
- Replace example data with your own
- Add or remove columns as needed
- Keep required columns: `date`, `latitude`, `longitude`

### Step 4: Save as CSV
- **Excel:** File → Save As → Choose "CSV (Comma delimited)"
- **Google Sheets:** File → Download → Comma Separated Values (.csv)
- **Text Editor:** Just save the file with .csv extension

### Step 5: Upload to Map
1. Open the MapLibre Time Slider app
2. Click "📤 Upload Data" button
3. Drag and drop your CSV file, or click to browse
4. Your data appears on the map!

---

## 📝 Required vs Optional Columns

### Required (Must Have)
- `date` or `timestamp` or `year` - When it happened
- `latitude` or `lat` - Latitude coordinate
- `longitude` or `lon` or `lng` - Longitude coordinate

### Optional (Nice to Have)
- `name` or `title` - Display name
- `description` - Details shown in popup
- Any other columns you want - they all appear in popups!

---

## 💡 Tips for Best Results

### Finding Coordinates
Use one of these tools to get latitude/longitude:
- **Google Maps:** Right-click location → Click coordinates to copy
- **OpenStreetMap:** Click "Show address" → Copy coordinates
- **GPS device:** Most show lat/long directly

### Date Formats
All these formats work:
- `2021-01-15` (Recommended)
- `2021-01-15T12:00:00Z` (With time)
- `2021` (Year only)
- `1645056000000` (Unix timestamp in milliseconds)

### Coordinate Format
- Use **decimal degrees**: `40.7128, -74.0060` ✅
- NOT degrees/minutes/seconds: `40°42'46"N, 74°00'22"W` ❌

### Adding Custom Columns
Feel free to add any columns you want:
```csv
date,latitude,longitude,name,my_custom_field,another_field
2021-01-01,40.7128,-74.0060,NYC,Custom Value,Another Value
```

All fields appear in the popup when clicking map features!

---

## 🎨 Customizing Templates

### Add More Columns
Just add column names to the header row:
```csv
date,latitude,longitude,name,color,size,icon
```

### Remove Columns
Delete any columns except the required ones:
- Must keep: `date`, `latitude`, `longitude`
- Can remove: Everything else

### Rename Columns (Flexible)
These column names are automatically recognized:

**For dates:**
- `date`, `timestamp`, `time`, `year`, `datetime`

**For latitude:**
- `latitude`, `lat`, `y`

**For longitude:**
- `longitude`, `lon`, `lng`, `long`, `x`

---

## 🔍 Validation

When you upload, the app checks:
- ✅ Required columns present
- ✅ Coordinates in valid range (-90 to 90 lat, -180 to 180 lon)
- ✅ Dates in recognized format
- ✅ File size under 10MB

You'll see helpful error messages if something needs fixing!

---

## 📦 File Locations

After downloading the project, find templates at:
```
maplibre-time-slider/
└── public/
    └── templates/
        ├── README.md (this file)
        ├── template_blank.csv
        ├── template_with_examples.csv
        ├── template_historical_events.csv
        ├── template_business_expansion.csv
        ├── template_personal_travel.csv
        └── template_project_timeline.csv
```

---

## 🆘 Need Help?

- See **DATA_FORMAT_GUIDE.md** for complete format specification
- See **IMPORT_GUIDE.md** for detailed import instructions
- Try the built-in example files first to understand the format

---

## 🎯 Quick Start Example

**Minimal working CSV:**
```csv
date,latitude,longitude,name
2021-01-15,40.7128,-74.0060,New York
2021-06-22,37.7749,-122.4194,San Francisco
2022-03-10,41.8781,-87.6298,Chicago
```

That's it! Just 3 columns and your data will work.

---

Happy mapping! 🗺️
