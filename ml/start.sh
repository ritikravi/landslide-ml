#!/bin/bash
# Start script for Render deployment

echo "🚀 Starting ML Prediction API..."
echo "📦 Installing dependencies..."

pip install -r requirements.txt

echo "✅ Dependencies installed"
echo "🔍 Checking for model file..."

if [ -f "landslide_model.pkl" ]; then
    echo "✅ Model file found"
else
    echo "⚠️  Warning: Model file not found!"
fi

echo "🌐 Starting Flask server on port ${ML_API_PORT:-5001}..."
python ml_api.py
