#!/bin/bash

echo "🔍 Checking Deployment Status"
echo "=============================="
echo ""

# Check GitHub
echo "1️⃣  GitHub Status"
echo "   Latest commit: $(git log -1 --oneline)"
echo "   Branch: $(git branch --show-current)"
echo "   Remote: $(git remote get-url origin)"
echo ""

# Check Render Backend
echo "2️⃣  Render Backend (https://landslide-api.onrender.com)"
echo "   Health check:"
curl -s https://landslide-api.onrender.com/health | python3 -m json.tool
echo ""
echo "   Testing satellite endpoint:"
SATELLITE_RESPONSE=$(curl -s https://landslide-api.onrender.com/api/satellite/latest)
if echo "$SATELLITE_RESPONSE" | grep -q "Cannot GET"; then
  echo "   ❌ Satellite endpoints NOT deployed yet"
  echo "   ⏳ Render may still be building..."
  echo "   Check: https://dashboard.render.com/"
else
  echo "   ✅ Satellite endpoints are live!"
  echo "$SATELLITE_RESPONSE" | python3 -m json.tool | head -20
fi
echo ""

# Check Vercel Frontend
echo "3️⃣  Vercel Frontend"
echo "   Project ID: prj_nFSSIhYgmDXtUy58w7cnsVCoHTR6"
echo "   Check status at: https://vercel.com/dashboard"
echo ""

echo "📋 Quick Actions:"
echo "   • View Render logs: https://dashboard.render.com/"
echo "   • View Vercel deploys: https://vercel.com/dashboard"
echo "   • Manual Render deploy: Dashboard → Manual Deploy → Deploy latest commit"
echo ""
