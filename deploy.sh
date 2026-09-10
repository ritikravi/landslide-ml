#!/bin/bash

echo "🚀 Deploying Landslide Monitoring System to Production"
echo "========================================================"
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found"
    echo "   Run this script from the project root directory"
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Deploy frontend to Vercel
echo "📤 Deploying frontend to Vercel..."
cd frontend

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found"
    echo "   Creating from .env.example..."
    cp .env.example .env.production
fi

echo ""
echo "🔧 Environment Variables Required:"
echo "   VITE_API_URL=https://landslide-api.onrender.com"
echo "   VITE_SOCKET_URL=https://landslide-api.onrender.com"
echo "   VITE_ML_API_URL=https://landslide-ml-api.onrender.com"
echo ""
echo "📝 You'll be asked to configure these if not already set"
echo ""

# Deploy to production
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your URLs:"
echo "   Frontend: Check the URL above from Vercel output"
echo "   ML API: https://landslide-ml-api.onrender.com"
echo "   Backend API: https://landslide-api.onrender.com"
echo ""
echo "🧪 Test your deployment:"
echo "   1. Open the Vercel URL in your browser"
echo "   2. Check the Dashboard page"
echo "   3. Verify ML Prediction Card appears"
echo "   4. Look for SHAP explanations"
echo ""
echo "🎉 Your landslide monitoring system is now live!"
