# CSV Template Quick Reference

## 🎯 Choose Your Template

All templates are located in `public/templates/`

| Template | Use Case | Key Features |
|----------|----------|--------------|
| **template_blank.csv** | Start from scratch | Minimal columns, fully customizable |
| **template_with_examples.csv** | Learn the format | Sample data to guide you |
| **template_historical_events.csv** | History & education | Includes significance ratings |
| **template_business_expansion.csv** | Business growth | Tracks stores, employees, revenue |
| **template_personal_travel.csv** | Travel logs | Countries, duration of stay |
| **template_project_timeline.csv** | Project management | Phases, status, budget tracking |

---

## ⚡ Quick Start

### Minimum Required CSV:
```csv
date,latitude,longitude,name
2021-01-15,40.7128,-74.0060,New York
2021-06-22,37.7749,-122.4194,San Francisco
```

### Recommended CSV:
```csv
date,latitude,longitude,name,description,category
2021-01-15,40.7128,-74.0060,New York,Important event here,Type A
2021-06-22,37.7749,-122.4194,San Francisco,Another event,Type B
```

---

## 📋 Required Columns

**Must include these (or their alternates):**

```csv
date          → or: timestamp, time, year, datetime
latitude      → or: lat, y
longitude     → or: lon, lng, long, x
```

**Everything else is optional!**

---

## 🎨 Column Examples

### Basic Columns
```csv
date,latitude,longitude,name,description
```

### With Categories
```csv
date,latitude,longitude,name,description,category,type
```

### Business Data
```csv
date,latitude,longitude,name,store_type,employees,revenue
```

### Historical Data
```csv
date,latitude,longitude,name,description,significance,era
```

### Project Data
```csv
date,latitude,longitude,name,phase,status,budget,completion
```

### Travel Data
```csv
date,latitude,longitude,name,country,days_stayed,cost,rating
```

---

## 📍 Finding Coordinates

### Google Maps Method
1. Right-click on location
2. Click the coordinates that appear
3. They're copied to clipboard!
4. Format: `40.7128, -74.0060` (latitude, longitude)

### Manual Entry
- **Latitude:** -90 (South Pole) to +90 (North Pole)
- **Longitude:** -180 (West) to +180 (East)
- Use **decimal format**: `40.7128` not `40°42'46"`

---

## 📅 Date Formats

All these work:

```csv
date
2021-01-15
2021-01-15T12:00:00Z
2021
1610755200000
```

**Recommended:** `YYYY-MM-DD` format (e.g., `2021-01-15`)

---

## 🔧 Customization Tips

### Add Your Own Columns
```csv
date,latitude,longitude,name,my_field,another_field
2021-01-01,40.7128,-74.0060,NYC,value1,value2
```
**All columns appear in popups!**

### Multiple Categories
```csv
date,latitude,longitude,name,category,subcategory,tags
2021-01-01,40.7128,-74.0060,NYC,Business,Tech,"startup,innovation"
```

### Numeric Data
```csv
date,latitude,longitude,name,population,area,gdp
2021-01-01,40.7128,-74.0060,New York,8336817,783.8,1700000000000
```

---

## ✅ Validation Checklist

Before uploading, check:

- [ ] First row contains column headers
- [ ] Has `date` (or `timestamp`/`year`) column
- [ ] Has `latitude` (or `lat`) column
- [ ] Has `longitude` (or `lon`/`lng`) column
- [ ] Coordinates are in decimal degrees
- [ ] Latitude values between -90 and 90
- [ ] Longitude values between -180 and 180
- [ ] Dates in consistent format
- [ ] File size under 10MB
- [ ] Saved as `.csv` format

---

## 🚀 Upload Process

1. **Open app** → http://localhost:5173
2. **Click** → "📤 Upload Data" button
3. **Drag & drop** your CSV or click to browse
4. **Watch** → Automatic validation and loading
5. **Explore** → Your data on the map!

---

## 💡 Pro Tips

### Start Small
Test with 5-10 rows first to verify format

### Use Examples
Try the built-in examples before creating your own

### Keep It Simple
Start with required columns, add more later

### Descriptive Names
Good descriptions make better popups!

### Consistent Dates
Use same date format throughout file

### Check Coordinates
Verify a few locations in Google Maps first

---

## 🎯 Common Use Cases

### Personal Project
```csv
date,latitude,longitude,name,description
```
Simple and effective!

### Business Analysis
```csv
date,latitude,longitude,name,type,revenue,employees
```
Track growth metrics

### Historical Research
```csv
date,latitude,longitude,name,description,category,significance,source
```
Document with citations

### Travel Blog
```csv
date,latitude,longitude,name,description,country,rating,photos
```
Rich travel stories

---

## 📥 Download Templates

Templates are in your project at:
```
maplibre-time-slider/public/templates/
```

Or create your own using the examples above!

---

## 🆘 Troubleshooting

**"No timestamp field found"**
→ Add a column named `date` or `timestamp`

**"Coordinates out of range"**
→ Check latitude (-90 to 90) and longitude (-180 to 180)

**"Invalid CSV"**
→ Make sure you have a header row with column names

**"File too large"**
→ Keep files under 10MB, split large datasets

---

## 📚 More Help

- **DATA_FORMAT_GUIDE.md** - Complete format specification
- **IMPORT_GUIDE.md** - Detailed import instructions
- **public/templates/README.md** - Template documentation

---

## 🎉 You're Ready!

Pick a template, add your data, and start visualizing your timeline!
