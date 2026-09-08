# 🚀 Deploy Earth Engine Service to Render - Step by Step

## Step 1: Create Service Account in Google Cloud Console

### 1.1 Go to Service Accounts Page
🔗 https://console.cloud.google.com/iam-admin/serviceaccounts?project=spaceclub-501318

### 1.2 Create Service Account
```
1. Click "CREATE SERVICE ACCOUNT"
2. Service account name: earth-engine-landslide
3. Service account ID: (auto-generated)
4. Description: Earth Engine API service for landslide monitoring
5. Click "CREATE AND CONTINUE"
```

### 1.3 Grant Permissions
```
Role: Earth Engine Resource Writer
(Search for "Earth Engine" and select it)

Click "CONTINUE" → "DONE"
```

### 1.4 Create JSON Key
```
1. Click on the service account you just created
2. Go to "KEYS" tab
3. Click "ADD KEY" → "Create new key"
4. Key type: JSON
5. Click "CREATE"
6. JSON file downloads automatically - SAVE IT SAFELY!
```

The JSON file looks like:
```json
{
  "type": "service_account",
  "project_id": "spaceclub-501318",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "earth-engine-landslide@spaceclub-501318.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

---

## Step 2: Register Service Account with Earth Engine

### 2.1 Go to Earth Engine Asset Manager
🔗 https://code.earthengine.google.com/

### 2.2 Register Service Account
```
1. Click on "Assets" tab (left sidebar)
2. Click your username
3. Click "New" → "Register a service account"
4. Paste the service account email:
   earth-engine-landslide@spaceclub-501318.iam.gserviceaccount.com
5. Click "Register"
```

### 2.3 Verify Registration
You should see the service account listed in your Earth Engine assets.

---

## Step 3: Deploy to Render

### 3.1 Go to Render Dashboard
🔗 https://dashboard.render.com/

### 3.2 Create New Web Service
```
1. Click "New +" → "Web Service"
2. Connect GitHub repository: ritikravi/landslide-ml
3. Configure:
   - Name: landslide-earth-engine-api
   - Region: Oregon (US West)
   - Branch: main
   - Root Directory: satellite_service
   - Runtime: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: gunicorn earth_engine_api:app
   - Instance Type: Free
```

### 3.3 Add Environment Variables
```
Click "Advanced" → "Add Environment Variable"

Variable 1:
Key: PORT
Value: 10000

Variable 2:
Key: GEE_SERVICE_ACCOUNT_KEY
Value: (paste ENTIRE contents of the JSON file you downloaded)
       Copy everything from { to } including all the private key

Variable 3:
Key: PYTHON_VERSION  
Value: 3.11.0
```

**IMPORTANT**: For `GEE_SERVICE_ACCOUNT_KEY`, paste the ENTIRE JSON file contents as a single line. Keep all the quotes, newlines (\n), etc.

### 3.4 Deploy
```
Click "Create Web Service"
Wait 3-5 minutes for deployment
```

---

## Step 4: Get Your Earth Engine API URL

Once deployed, Render gives you a URL like:
```
https://landslide-earth-engine-api.onrender.com
```

Copy this URL - you'll need it for Step 5!

---

## Step 5: Update Backend Environment Variables

### 5.1 Go to Render Backend Service
Find your Node.js backend service on Render dashboard

### 5.2 Add/Update Environment Variable
```
Key: GEE_API_URL
Value: https://landslide-earth-engine-api.onrender.com
```

### 5.3 Manual Deploy
Click "Manual Deploy" → "Deploy latest commit"

---

## Step 6: Update Frontend Components

The frontend is already configured to call `/api/gee/*` endpoints through the backend.

### 6.1 Re-enable Widgets
We need to uncomment the GPM and Vegetation widgets in Dashboard.jsx

---

## Step 7: Test Deployment

### 7.1 Test Earth Engine Service
```bash
curl https://landslide-earth-engine-api.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "earth_engine": "connected",
  "timestamp": "2026-09-08T..."
}
```

### 7.2 Test Through Backend
```bash
curl https://your-backend.onrender.com/api/gee/health
```

### 7.3 Test on Live Site
Open your Vercel site, should see:
- 🛰️ GPM Rainfall widget working
- 🌱 Vegetation Health widget working

---

## 🆘 Troubleshooting

### "Service account not registered"
- Make sure you registered the service account email in Earth Engine Code Editor
- Wait 5-10 minutes after registration

### "Invalid JSON in service account key"
- Make sure you copied the ENTIRE JSON file
- Include all curly braces { }
- Include all quotation marks
- Don't modify the private key section

### "Earth Engine not initialized"
- Check the service account has "Earth Engine Resource Writer" role
- Verify the JSON key is correct in Render environment variables
- Check Render logs for specific error messages

### Backend can't reach Earth Engine service
- Make sure `GEE_API_URL` is set in backend Render environment
- Make sure Earth Engine service is deployed and healthy
- Check both services are in same region (faster)

---

## ✅ Success Checklist

- [ ] Service account created in Google Cloud
- [ ] JSON key downloaded and saved
- [ ] Service account registered in Earth Engine
- [ ] Earth Engine service deployed to Render
- [ ] `GEE_SERVICE_ACCOUNT_KEY` added to Render
- [ ] Earth Engine health check returns "connected"
- [ ] Backend `GEE_API_URL` environment variable set
- [ ] Backend redeployed
- [ ] Frontend widgets enabled
- [ ] Live site shows GPM + Vegetation data

---

## 📝 Quick Reference

**Service Account Email Format:**
```
earth-engine-landslide@spaceclub-501318.iam.gserviceaccount.com
```

**Earth Engine Service URL (after deployment):**
```
https://landslide-earth-engine-api.onrender.com
```

**Backend Environment Variable:**
```
GEE_API_URL=https://landslide-earth-engine-api.onrender.com
```

---

Ready to start? Go to Step 1! 🚀
