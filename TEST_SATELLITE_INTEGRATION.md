# 🧪 Test Satellite Integration

## Quick Test Script

Run these commands to test your satellite integration:

### 1. Start Backend
```bash
cd backend
npm start
```

Wait for:
```
🚀 Server running on port 5000
📡 Socket.IO ready for connections
🔄 Auto-update: Checking satellite data...
📡 Satellite data outdated, fetching new data...
🛰️  Fetching NASA POWER data for (30.97, 76.52) from 20240518 to 20240617
✅ NASA POWER data received
✅ Saved 30 satellite data records
✅ Satellite data updated successfully
```

### 2. Test API Endpoints

**Test Status:**
```bash
curl http://localhost:5000/api/satellite/status
```

Expected:
```json
{
  "success": true,
  "needsUpdate": false,
  "latestDataDate": "2024-06-17T00:00:00.000Z",
  "dataAge": 0,
  "location": { "lat": 30.97, "lon": 76.52 }
}
```

**Test Latest Data:**
```bash
curl http://localhost:5000/api/satellite/latest
```

Expected:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "location": { "latitude": 30.97, "longitude": 76.52 },
    "rainfall": 12.5,
    "rainfall7Day": 45.8,
    "rainfall30Day": 189.3,
    "temperature": 28.5,
    "humidity": 75.2,
    "source": "NASA_POWER",
    "dataDate": "2024-06-17T00:00:00.000Z"
  }
}
```

**Test History (Last 7 Days):**
```bash
curl "http://localhost:5000/api/satellite/history?days=7"
```

**Test Rainfall Summary:**
```bash
curl http://localhost:5000/api/satellite/rainfall-summary
```

Expected:
```json
{
  "success": true,
  "data": {
    "rainfall24h": 12.5,
    "rainfall7day": 45.8,
    "rainfall30day": 189.3,
    "temperature": 28.5,
    "humidity": 75.2,
    "riskScore": 35,
    "lastUpdate": "2024-06-17T00:00:00.000Z"
  }
}
```

**Manually Trigger Update:**
```bash
curl -X POST http://localhost:5000/api/satellite/update \
  -H "Content-Type: application/json" \
  -d '{"lat": 30.97, "lon": 76.52, "days": 30}'
```

Expected:
```json
{
  "success": true,
  "message": "Updated 30 satellite data records",
  "count": 30,
  "latestDate": "2024-06-17T00:00:00.000Z"
}
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. View in Browser

**Dashboard:**
- Open http://localhost:5173
- Scroll down to "Satellite Rainfall Data" section
- Should see:
  - Summary cards (24h, 7-day, 30-day rainfall)
  - Rainfall risk score
  - Daily rainfall bar chart
  - 7-day cumulative line chart
  - Green "NASA POWER Satellite Data" indicator

**Satellite Page:**
- Navigate to http://localhost:5173/satellite
- Or click "View Details →" on dashboard
- Should see:
  - Header with satellite icon
  - "Update Data" button
  - Status cards (Location, Latest Data, Data Age)
  - Full rainfall charts
  - About NASA POWER section
  - Export options

### 5. Test Update Button

1. Go to http://localhost:5173/satellite
2. Click "Update Data" button
3. Should see:
   - Button changes to "Updating..."
   - Spinner animation
   - Alert: "✅ Successfully updated X records"
   - Charts refresh with new data

---

## 🔍 Troubleshooting

### Issue: Backend won't start
**Error**: `Cannot find module 'axios'`

**Fix**:
```bash
cd backend
npm install
```

### Issue: "Unable to load satellite data"
**Possible causes:**
1. Backend not running
2. MongoDB not connected
3. NASA POWER API timeout

**Fix**:
1. Check backend console for errors
2. Verify MongoDB connection string in `.env`
3. Try manual update via curl
4. Check internet connection (NASA API requires internet)

### Issue: Charts show "No data available"
**Cause**: Database is empty

**Fix**:
```bash
curl -X POST http://localhost:5000/api/satellite/update \
  -H "Content-Type: application/json" \
  -d '{"days": 30}'
```

### Issue: NASA POWER API errors
**Error**: `429 Too Many Requests` or timeout

**Cause**: API rate limiting or slow response

**Fix**:
- Wait a few minutes
- NASA POWER API can be slow (30-60 seconds)
- Free tier has rate limits
- Try reducing `days` parameter

---

## ✅ Success Criteria

- [ ] Backend starts without errors
- [ ] Console shows "✅ Satellite data updated successfully"
- [ ] `/api/satellite/status` returns valid JSON
- [ ] `/api/satellite/latest` returns data with rainfall values
- [ ] Frontend dashboard shows satellite section
- [ ] Charts render with data (not empty)
- [ ] `/satellite` page loads
- [ ] Update button works
- [ ] No console errors in browser

---

## 📊 Expected Data

Your location (30.97°N, 76.52°E) is near Chandigarh, India.

**Typical Rainfall Patterns:**
- **January-March**: 0-5mm/day (dry season)
- **April-June**: 5-20mm/day (pre-monsoon)
- **July-September**: 20-100mm/day (monsoon)
- **October-December**: 0-10mm/day (post-monsoon)

If you're testing in June, expect:
- Daily rainfall: 0-50mm
- 7-day cumulative: 0-200mm
- 30-day cumulative: 50-500mm
- Risk score: 20-60 (LOW to MEDIUM)

---

## 🎯 Next Steps

Once everything works:
1. ✅ Leave backend running (auto-updates daily)
2. ✅ Monitor satellite data page
3. ✅ Proceed to Phase 2: ML model enhancement
4. ✅ Retrain model with satellite features

---

Last Updated: June 17, 2024
