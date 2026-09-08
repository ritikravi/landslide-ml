# 🔐 Earth Engine Authentication - Quick Start

## Step 1: Kill the running process

```bash
# Find and kill process on port 5002
lsof -ti:5002 | xargs kill -9
```

## Step 2: Activate virtual environment

```bash
cd satellite_service
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

## Step 3: Authenticate Earth Engine

```bash
earthengine authenticate
```

**What happens:**
1. Browser opens automatically
2. Sign in with the Google account you used for Earth Engine registration
3. Click "Allow" to grant access
4. Browser shows an authorization code
5. Copy the authorization code
6. Paste it back in your terminal
7. Press Enter

**If browser doesn't open:**
- Copy the URL from terminal
- Paste in your browser manually
- Complete authentication
- Copy code back to terminal

## Step 4: Verify authentication worked

```bash
python -c "import ee; ee.Initialize(); print('✅ Earth Engine authenticated successfully!')"
```

You should see: `✅ Earth Engine authenticated successfully!`

## Step 5: Start the service

```bash
python earth_engine_api.py
```

You should see:
```
✅ Earth Engine initialized successfully
🛰️  Google Earth Engine API starting on port 5002
🌍 Default location: 30.97, 76.52
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5002
```

## Step 6: Test the API (in new terminal)

```bash
# Open NEW terminal window
cd satellite_service
./test_api.sh
```

Expected output:
```
✅ Health: Earth Engine connected
✅ GPM Rainfall: 15.3 mm (last 24 hours)
✅ Sentinel-2 NDVI: 0.65 (Healthy vegetation)
✅ Rainfall Summary: 3h, 24h, 7d data
✅ Combined Analysis: Ready for ML model
```

---

## 🆘 Troubleshooting

### "earthengine: command not found"
```bash
# Make sure venv is activated
source venv/bin/activate

# Reinstall earthengine CLI
pip install earthengine-api
```

### "Please authorize access"
You need to run `earthengine authenticate` first. This is a one-time setup.

### "Port 5002 already in use"
```bash
# Kill the process
lsof -ti:5002 | xargs kill -9

# Try again
python earth_engine_api.py
```

### Authentication successful but still getting errors?
```bash
# Clear credentials and re-authenticate
rm -rf ~/.config/earthengine/credentials
earthengine authenticate
```

---

## ✅ Next Steps After Authentication

Once Earth Engine is authenticated and working:

1. **Keep service running** (in one terminal)
2. **Test all endpoints** (in another terminal with `./test_api.sh`)
3. **Integrate with Node.js backend** (I'll help with this)
4. **Update frontend** to show GPM near-realtime data
5. **Deploy to Render** (requires service account setup)

---

**Start with Step 1 now!** 🚀
