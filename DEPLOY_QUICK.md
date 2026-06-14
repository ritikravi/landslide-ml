# 🚀 Quick Deployment Guide (5 Minutes)

## Step 1: MongoDB Atlas (2 min)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create **FREE M0** cluster
3. **Database Access** → Add user → Save password
4. **Network Access** → Allow `0.0.0.0/0`
5. **Connect** → Copy connection string:
   ```
   mongodb+srv://user:PASSWORD@cluster0.xxxxx.mongodb.net/landslide_monitoring
   ```

## Step 2: Deploy Backend on Render (2 min)
1. Go to https://dashboard.render.com/
2. **New +** → **Web Service**
3. Connect GitHub: `ritikravi/landslide-ml`
4. Settings:
   - **Root Directory**: `backend`
   - **Build**: `npm install`
   - **Start**: `npm start`
5. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-connection-string>
   CORS_ORIGIN=*
   ```
6. **Create** → Wait 5 minutes
7. Copy URL: `https://landslide-api-xxxx.onrender.com`

## Step 3: Deploy Frontend on Vercel (1 min)

### Option A: CLI (Fastest)
```bash
npm install -g vercel
cd frontend
vercel --prod
```
Add when prompted:
- `VITE_API_URL`: Your Render URL
- `VITE_SOCKET_URL`: Your Render URL

### Option B: Dashboard
1. Go to https://vercel.com/new
2. Import `ritikravi/landslide-ml`
3. Settings:
   - **Root Directory**: `frontend`
   - **Framework**: Vite
   - **Build**: `npm run build`
4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-render-url.onrender.com
   VITE_SOCKET_URL=https://your-render-url.onrender.com
   ```
5. **Deploy**

## Step 4: Update CORS
1. Render → Your service → **Environment**
2. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   https://your-app.vercel.app
   ```
3. Save (auto-redeploys)

## ✅ Done!
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-api.onrender.com`

## Test It
```bash
curl https://your-api.onrender.com/health
```

Visit your Vercel URL and start monitoring! 🌍

---

**Need help?** See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide.
