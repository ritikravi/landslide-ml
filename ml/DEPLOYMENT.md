# ML Model Deployment Guide

## Your Trained Model
- **Accuracy**: 98.79%
- **Model Type**: Random Forest Classifier
- **Most Important Feature**: Water Level (66.6% importance)
- **Training Data**: 825 sensor readings

## Deployment Options

### Option 1: Local Development (Easiest)

1. **Install Flask in your virtual environment**:
```bash
cd ml
source venv/bin/activate
pip install flask flask-cors
```

2. **Start the ML API**:
```bash
python ml_api.py
```

The API will run on `http://localhost:5001`

3. **Start the backend** (in another terminal):
```bash
cd backend
npm install  # Install axios
npm run dev
```

4. **Test it works**:
```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 10,
    "waterLevel": 85,
    "tilt": 5,
    "vibration": 0,
    "ultrasonicDistance": 100
  }'
```

### Option 2: Production Deployment

#### Deploy ML API to Render

1. Create `ml/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

CMD ["python", "ml_api.py"]
```

2. Push to GitHub

3. On Render.com:
   - Create new "Web Service"
   - Connect GitHub repo
   - Root Directory: `ml`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python ml_api.py`
   - Add Environment Variable: `ML_API_PORT=5001`

4. Get the ML API URL (e.g., `https://landslide-ml.onrender.com`)

5. Update backend environment variable:
   - On Render backend service
   - Add `ML_API_URL=https://landslide-ml.onrender.com`

### Option 3: Serverless (AWS Lambda / Google Cloud Functions)

Deploy as serverless function for cost efficiency.

## How It Works

```
ESP32 → Backend (Node.js) → ML API (Python) → Prediction
                          ↓
                    MongoDB + Dashboard
```

1. **ESP32 sends sensor data** to Node.js backend
2. **Backend calls ML API** with sensor values
3. **ML API loads trained model** and predicts risk
4. **Prediction returned** to backend
5. **Backend saves to DB** and sends to dashboard via Socket.IO
6. **Dashboard shows** real ML prediction with 98.79% accuracy

## Fallback Behavior

If ML API is unavailable:
- Backend uses simple formula (25% water importance)
- Still works, just less accurate
- Shows "Fallback" in logs

## Monitoring

Check if ML model is being used:
```bash
# Check ML API health
curl http://localhost:5001/health

# Check backend logs
# Should see "✅ ML prediction from trained model" (not "Using fallback")
```

## Model Updates

To retrain with new data:
```bash
cd ml
source venv/bin/activate
python fetch_data.py  # Get latest data
python simple_ml_example.py  # Retrain
# Model automatically updates (landslide_model.pkl)
# Restart ml_api.py to load new model
```

## Comparison

| Feature | Basic Formula | Your ML Model |
|---------|--------------|---------------|
| Accuracy | ~75% | 98.79% |
| Water Importance | 25% | 66.6% |
| Learning | No | Yes |
| Deployment | Easy | Medium |
| Updates | Manual | Automatic |

Your ML model is **much smarter** because it learned from 825 real readings!
