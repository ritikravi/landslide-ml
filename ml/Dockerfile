FROM python:3.11-slim

WORKDIR /app

# Install system dependencies required by LightGBM
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY ml_api.py .
COPY trend_forecasting.py .
COPY landslide_model.pkl .
COPY landslide_model_historical.pkl .
COPY model_metadata_historical.json .
COPY anomaly_model.pkl .
COPY anomaly_scaler.pkl .
COPY anomaly_thresholds.pkl .

# Expose port (Render will override with PORT env var)
EXPOSE 10000

# Run the application with gunicorn (production server)
CMD gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 2 --timeout 120 ml_api:app
