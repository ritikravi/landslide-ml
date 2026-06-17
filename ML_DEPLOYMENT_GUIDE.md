# 🚀 ML Model Deployment Guide - Step by Step

Your trained ML model (98.79% accuracy) can be deployed in multiple ways. Here are all options:

---

## ✅ Option 1: Render.com (RECOMMENDED - Free & Easy)

### Why Render?
- ✅ Free tier available
- ✅ Same platform as your backend
- ✅ Auto-deploy from GitHub
- ✅ Built-in SSL/HTTPS
- ✅ Easy environment variables

### Steps:

**1. Commit Your Model File**

The model needs to be in your GitHub repo:
```bash
# Remove .pkl from .gitignore temporarily
cd ml
nano .gitignore  # Remove "*.pkl" line

# Add the model
git add landslide_model.pkl
git commit -m "Add trained ML model for deployment"
git push origin main
```

**2. Go to Render.com**

- Visit: https://dashboard.render.com
- Sign in with GitHub (same account)

**3. Create New Web Service**

- Click **"New +"** → **"Web Service"**
- Connect your GitHub repo: `ritikravi/landslide-ml`
- Configure:
  - **Name**: `landslide-ml-api`
  - **Region**: Oregon (US West)
  - **Branch**: `main`
  - **Root Directory**: `ml`
  - **Environment**: `Python 3`
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `python ml_api.py`
  
**4. Add Environment Variable**

- Click **"Advanced"**
- Add environment variable:
  - **Key**: `ML_API_PORT`
  - **Value**: `5001`

**5. Deploy**

- Click **"Create Web Service"**
- Wait 5-10 minutes for deployment
- Get your URL: `https://landslide-ml-api.onrender.com`

**6. Update Backend**

On Render backend service:
- Go to your backend service
- Click **"Environment"**
- Add new variable:
  - **Key**: `ML_API_URL`
  - **Value**: `https://landslide-ml-api.onrender.com`
- Click **"Save Changes"**
- Backend will auto-redeploy

**7. Test**

```bash
curl -X POST https://landslide-ml-api.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 10,
    "waterLevel": 85,
    "tilt": 5,
    "vibration": 0,
    "ultrasonicDistance": 100
  }'
```

Expected response:
```json
{
  "success": true,
  "prediction": {
    "riskLevel": "MEDIUM",
    "riskScore": 50,
    "confidence": 89.5
  }
}
```

**✅ Done! Your ML model is live!**

---

## 🐳 Option 2: Docker + Render (Advanced)

If you want to use Docker:

**1. Build locally to test**:
```bash
cd ml
docker build -t landslide-ml .
docker run -p 5001:5001 landslide-ml
```

**2. Deploy to Render**:
- Same steps as Option 1
- But select **"Docker"** as environment
- Render will use `Dockerfile`

---

## ☁️ Option 3: Railway.app (Alternative Free)

Similar to Render:

**1. Visit**: https://railway.app
**2. Sign in** with GitHub
**3. New Project** → Deploy from GitHub repo
**4. Select** `ml` folder
**5. Railway** auto-detects Python and deploys
**6. Get URL** and add to backend env

---

## ⚡ Option 4: AWS Lambda (Serverless)

Best for cost efficiency (free tier = 1M requests/month)

**Requirements**:
```bash
pip install zappa
```

**Configuration** (`zappa_settings.json`):
```json
{
  "production": {
    "app_function": "ml_api.app",
    "aws_region": "us-east-1",
    "runtime": "python3.11",
    "s3_bucket": "landslide-ml-lambda"
  }
}
```

**Deploy**:
```bash
zappa deploy production
```

---

## 🌐 Option 5: Google Cloud Run (Serverless)

Pay only when API is called:

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/landslide-ml
gcloud run deploy landslide-ml \
  --image gcr.io/PROJECT_ID/landslide-ml \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🏠 Option 6: Local + ngrok (Testing)

For testing without deploying:

**1. Install ngrok**:
```bash
brew install ngrok  # Mac
# or download from https://ngrok.com
```

**2. Start ML API**:
```bash
cd ml
source venv/bin/activate
python ml_api.py
```

**3. Expose with ngrok** (in another terminal):
```bash
ngrok http 5001
```

**4. Use the ngrok URL**:
```
https://abc123.ngrok.io
```

**5. Add to backend env**:
```bash
export ML_API_URL=https://abc123.ngrok.io
```

**Note**: ngrok URLs change each time. Good for testing only.

---

## 💰 Cost Comparison

| Platform | Free Tier | Cost After | Best For |
|----------|-----------|------------|----------|
| **Render** | 750 hrs/mo | $7/mo | Simple deployment |
| Railway | $5 credit | $5-10/mo | Quick setup |
| AWS Lambda | 1M requests | $0.20/1M | High traffic |
| Google Run | 2M requests | $0.40/1M | Auto-scaling |
| Vercel | ❌ No Python | N/A | Frontend only |
| ngrok | Free (limited) | $8/mo | Testing |

**Recommendation**: Start with **Render free tier** (same as your backend)

---

## 🔧 Troubleshooting

### Issue: Model file too large for GitHub
**Solution**: Use Git LFS (Large File Storage)
```bash
git lfs install
git lfs track "*.pkl"
git add .gitattributes
git add landslide_model.pkl
git commit -m "Add model with LFS"
git push
```

### Issue: Deployment fails with memory error
**Solution**: Upgrade to paid tier or compress model
```python
# Compress model
import joblib
from sklearn.tree import DecisionTreeClassifier

# Train smaller model
small_model = DecisionTreeClassifier(max_depth=10)
small_model.fit(X_train, y_train)
joblib.dump(small_model, 'small_model.pkl')
```

### Issue: Slow predictions
**Solution**: 
1. Use model caching
2. Upgrade to paid tier
3. Use Redis for caching predictions

### Issue: Backend can't reach ML API
**Solution**: Check CORS and network settings
```python
# In ml_api.py
from flask_cors import CORS
CORS(app, resources={r"/*": {"origins": "*"}})
```

---

## 📊 Monitoring Your Deployed Model

### Check Health
```bash
curl https://your-ml-api.onrender.com/health
```

### Monitor Logs
- Render Dashboard → Your Service → Logs
- Watch for prediction requests
- Check for errors

### Performance Metrics
- Response time (should be < 500ms)
- Error rate (should be < 1%)
- Uptime (should be > 99%)

---

## 🔄 Updating the Model

When you retrain with new data:

**1. Retrain locally**:
```bash
cd ml
source venv/bin/activate
python fetch_data.py
python simple_ml_example.py
```

**2. Commit new model**:
```bash
git add landslide_model.pkl
git commit -m "Update model with latest data"
git push origin main
```

**3. Render auto-deploys** (takes 5-10 minutes)

**4. Test new deployment**:
```bash
curl https://your-ml-api.onrender.com/health
# Check model_loaded: true
```

---

## ✅ Verification Checklist

After deployment:

- [ ] ML API health endpoint responds
- [ ] Prediction endpoint returns correct format
- [ ] Backend can reach ML API
- [ ] Dashboard shows ML predictions (not fallback)
- [ ] Check backend logs for "✅ ML prediction from trained model"
- [ ] Risk scores are different from before (using 66% water weight)
- [ ] Confidence scores are shown
- [ ] Model version is correct

---

## 🎯 Quick Start (5 Minutes)

**Fastest way to deploy RIGHT NOW**:

```bash
# 1. Commit model
cd ml
git add landslide_model.pkl Dockerfile requirements.txt ml_api.py
git commit -m "Deploy ML model"
git push origin main

# 2. Go to Render.com → New Web Service
# 3. Select your repo → Root Directory: ml
# 4. Start Command: python ml_api.py
# 5. Click Deploy
# 6. Wait 5 minutes
# 7. Copy URL
# 8. Add to backend env: ML_API_URL=<your-url>

# Done! ✅
```

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Flask Docs**: https://flask.palletsprojects.com/
- **Scikit-learn**: https://scikit-learn.org/stable/

**Your model is ready to deploy!** 🚀

Choose Option 1 (Render) for the easiest deployment path.
