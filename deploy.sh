#!/bin/bash

echo "🚀 Landslide Monitoring - Deployment Helper"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
    echo "Install it with: npm install -g vercel"
    echo ""
fi

echo -e "${BLUE}📋 Deployment Checklist:${NC}"
echo ""
echo "1. MongoDB Atlas:"
echo "   - Create free cluster at https://www.mongodb.com/cloud/atlas/register"
echo "   - Get connection string"
echo ""
echo "2. Deploy Backend (Render):"
echo "   - Go to https://dashboard.render.com/"
echo "   - New → Web Service"
echo "   - Connect GitHub repo: landslide-ml"
echo "   - Root Directory: backend"
echo "   - Build: npm install"
echo "   - Start: npm start"
echo "   - Add Environment Variables (see DEPLOYMENT.md)"
echo ""
echo "3. Deploy Frontend (Vercel):"
echo "   - Option A (CLI): cd frontend && vercel --prod"
echo "   - Option B (Dashboard): https://vercel.com/new"
echo "   - Connect GitHub repo"
echo "   - Root Directory: frontend"
echo "   - Framework: Vite"
echo "   - Add VITE_API_URL environment variable"
echo ""
echo -e "${GREEN}✅ Full guide: See DEPLOYMENT.md${NC}"
echo ""

read -p "Deploy frontend now using Vercel CLI? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v vercel &> /dev/null; then
        cd frontend
        echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
        vercel --prod
    else
        echo -e "${YELLOW}Please install Vercel CLI first: npm install -g vercel${NC}"
    fi
fi
