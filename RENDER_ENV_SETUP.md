# 🔧 Render Environment Variables Setup

## Good News! 🎉
The satellite integration **doesn't require any new environment variables**. It uses the NASA POWER API which is completely free and doesn't need an API key.

## Current Environment Variables on Render

You should already have these set in your Render dashboard:

### ✅ Required (Already Set)
```
NODE_ENV=production
PORT=5000  (or let Render auto-assign)
MONGODB_URI=mongodb+srv://Cluster63640:ritik1641@cluster63640...
CORS_ORIGIN=*
```

### ⚠️ Optional (If you want weather features)
```
OPENWEATHER_API_KEY=your_key_here
```

## 🔍 Verify Your Render Environment Variables

1. Go to: **https://dashboard.render.com/**
2. Select your backend service: **landslide-monitoring-api**
3. Click **"Environment"** tab on the left
4. Check these variables exist:

### Must Have:
- `NODE_ENV` = `production` ✅
- `MONGODB_URI` = `mongodb+srv://Cluster63640:ritik1641@...` ✅
- `PORT` = `5000` (or blank - Render auto-assigns) ✅
- `CORS_ORIGIN` = `*` ✅

## 🚀 If You Need to Update

### Change PORT back to 5000 for Render:
The local `.env` has `PORT=5001` to avoid conflicts locally, but Render should use:
- **PORT**: `5000` (or leave blank for Render's auto-assignment)

### Steps:
1. Render Dashboard → Your Service
2. Environment tab
3. Edit `PORT` → Set to `5000` or leave blank
4. Click **"Save Changes"**
5. Service will auto-redeploy

## 📝 All Environment Variables Explained

| Variable | Value | Purpose | Required? |
|----------|-------|---------|-----------|
| `NODE_ENV` | `production` | Sets production mode | ✅ Yes |
| `PORT` | `5000` or blank | Server port | ✅ Yes |
| `MONGODB_URI` | Your MongoDB URL | Database connection | ✅ Yes |
| `CORS_ORIGIN` | `*` | Allow all origins | ✅ Yes |
| `OPENWEATHER_API_KEY` | API key | Weather data | ⚪ Optional |

## 🛰️ Satellite Integration - No Setup Needed!

The satellite features use **NASA POWER API** which:
- ✅ Is completely FREE
- ✅ No API key required
- ✅ No authentication needed
- ✅ Unlimited requests
- ✅ Works immediately after deployment

## 🎯 Action Items

### Quick Check (Recommended):
1. Go to Render Dashboard
2. Navigate to Environment tab
3. Verify `MONGODB_URI` is set (most important!)
4. Verify `CORS_ORIGIN=*` is set
5. `PORT` should be `5000` or blank

### If Everything Looks Good:
Just trigger a **Manual Deploy**:
1. Render Dashboard → Your Service
2. Click **"Manual Deploy"** button (top right)
3. Select **"Deploy latest commit"**
4. Wait 5-10 minutes
5. Test: `curl https://landslide-api.onrender.com/api/satellite/latest`

## ✅ Verification After Deploy

Run this to check if satellite endpoints work:

```bash
# Test health
curl https://landslide-api.onrender.com/health

# Test satellite endpoint (should return data, not 404)
curl https://landslide-api.onrender.com/api/satellite/latest

# Test rainfall summary
curl https://landslide-api.onrender.com/api/satellite/rainfall-summary
```

## 🆘 Troubleshooting

### If you get 500 errors:
- Check `MONGODB_URI` is correct in Render
- Check Render logs for connection errors

### If you get 404 errors:
- Deploy hasn't completed yet
- Check Render logs to see if build succeeded
- Verify you're on latest commit

### If database errors:
- MongoDB URI might be wrong
- Check MongoDB Atlas whitelist (should allow all IPs: `0.0.0.0/0`)

## 📋 Summary

**For Satellite Integration:**
- ❌ No new environment variables needed
- ❌ No API keys to add
- ✅ Just deploy latest code
- ✅ NASA POWER API works automatically

**Your Action:**
Just make sure existing env vars are set, then deploy! 🚀
