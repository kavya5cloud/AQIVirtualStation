# Satellite Air Quality Scanner - Backend Code

Since this is a client-side React preview, the following Python backend code cannot be executed directly here. However, this is the exact code you requested to deploy on your local machine or Google Cloud Run.

### 1. Requirements (`requirements.txt`)

```text
Flask==3.0.0
earthengine-api==0.1.390
google-auth==2.27.0
flask-cors==4.0.0
numpy==1.26.0
```

### 2. Application Code (`app.py`)

```python
import os
import ee
from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)

# Initialize Earth Engine
try:
    ee.Initialize(project='kavya-space-project')
except Exception as e:
    print(f"Authentication failed: {e}")

def get_satellite_value(collection_name, band_name, point, days=30):
    """Helper to fetch mean value from a collection."""
    try:
        collection = ee.ImageCollection(collection_name) \
            .select(band_name) \
            .filterDate(
                ee.Date(datetime.datetime.now() - datetime.timedelta(days=days)),
                ee.Date(datetime.datetime.now())
            ) \
            .filterBounds(point)
        
        mean_image = collection.mean()
        
        info = mean_image.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=point,
            scale=1000  # 1km resolution
        ).getInfo()
        
        val = info.get(band_name)
        return val if val is not None else 0.0
    except Exception as e:
        print(f"Error fetching {band_name}: {e}")
        return 0.0

@app.route('/scan', methods=['POST'])
def scan():
    data = request.json
    lat = data.get('lat')
    lon = data.get('lon')

    if not lat or not lon:
        return jsonify({'error': 'Missing coordinates'}), 400

    point = ee.Geometry.Point([float(lon), float(lat)])

    # 1. Fetch Raw Data from 3 Satellites
    # Sentinel-5P NO2
    raw_no2 = get_satellite_value('COPERNICUS/S5P/OFFL/L3_NO2', 'tropospheric_NO2_column_number_density', point)
    
    # Sentinel-5P CO
    raw_co = get_satellite_value('COPERNICUS/S5P/OFFL/L3_CO', 'CO_column_number_density', point)
    
    # Sentinel-5P Aerosol Index
    raw_aerosol = get_satellite_value('COPERNICUS/S5P/OFFL/L3_AER_AI', 'absorbing_aerosol_index', point)

    # 2. Normalize to 0-100 Score
    # Formulas provided in requirements
    
    # NO2: Raw * 1,000,000
    score_no2 = min(raw_no2 * 1000000, 100)
    
    # CO: Raw * 1,000
    score_co = min(raw_co * 1000, 100)
    
    # Aerosol: (Raw + 1) * 30. Note: AI is often negative (-2 to +2 range typical)
    # Adding 1 shifts typical range to -1 to 3. 
    score_aerosol = min(max((raw_aerosol + 1) * 30, 0), 100) 

    # 3. Calculate Overall Space AQI (Max Rule)
    overall_aqi = int(max(score_no2, score_co, score_aerosol))

    # 4. Determine Health Status
    if overall_aqi <= 33:
        status = "Good"
    elif overall_aqi <= 66:
        status = "Moderate"
    else:
        status = "Unhealthy"

    # 5. Identify Dominant Pollutant
    scores = {
        "Traffic Gas (NO2)": score_no2, 
        "Carbon Monoxide (CO)": score_co, 
        "Dust/Smoke (Aerosols)": score_aerosol
    }
    dominant = max(scores, key=scores.get)

    return jsonify({
        "overall_aqi": overall_aqi,
        "components": {
            "no2": raw_no2,
            "no2Score": int(score_no2),
            "co": raw_co,
            "coScore": int(score_co),
            "aerosol": raw_aerosol,
            "aerosolScore": int(score_aerosol)
        },
        "dominant_pollutant": dominant,
        "health_status": status
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```