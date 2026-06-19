# 🔮 Predictions Page - User Guide

## Overview
A dedicated page for AI-powered trend analysis and future risk forecasting, separate from the main dashboard.

## Access
Navigate to: **Predictions** (Brain icon 🧠 in the top menu)

Direct URL: `https://frontend-kappa-two-57.vercel.app/predictions`

---

## Page Layout

### 1. **Header Section**
```
🧠 AI-Powered Risk Predictions
Analyzing sensor trends to forecast future landslide risk levels 
using Random Forest ML model with 98.79% accuracy
```

### 2. **Critical Warnings** (if any)
Red animated alert boxes showing:
- ⚠️ "Risk may escalate to MEDIUM in 30 minutes"
- ⚠️ "Soil Moisture rising rapidly, Water Level increasing"
- Confidence percentage and severity level

### 3. **Current Risk Status**
4-card grid showing:
- **Risk Level**: LOW / MEDIUM / HIGH / CRITICAL
- **Risk Score**: 0-100 scale
- **ML Confidence**: Model confidence percentage
- **Model Used**: RandomForest / Fallback

### 4. **Sensor Trend Analysis**
4 detailed cards (one per sensor):
- Current value with large display
- Trend indicator: ⬆ Increasing / ⬇ Decreasing / ➖ Stable
- Confidence bar (0-100%)
- Color-coded status badges
- Animated pulse dot

**Sensors Tracked:**
- Soil Moisture (%)
- Water Level (cm)
- Tilt Angle (°)
- Vibration (events)

### 5. **Future Risk Forecasts**
3 prediction cards showing:

#### 30 Minutes Ahead
- Predicted risk level badge
- Risk score with colored progress bar
- All predicted sensor values
- Forecast confidence

#### 1 Hour Ahead
- Same format as 30-minute forecast
- Shows how risk evolves

#### 2 Hours Ahead
- Longest-range prediction
- Helps plan preventive actions

**Special Features:**
- 🔴 Red border if risk is escalating
- ⬆ Bouncing arrow for increasing risk
- Color-coded based on severity
- Hover effect scales cards

### 6. **Analysis Summary**
Bottom section with 3 metrics:
- **Historical Readings**: Number of data points used
- **Forecasts Generated**: Number of predictions (usually 3)
- **Last Updated**: Timestamp of latest analysis

---

## When Data is Insufficient

If less than 5 historical readings exist, shows:

```
🧠 Collecting Data for Predictions

The ML prediction system needs at least 5 historical 
readings to analyze trends and forecast future risk levels.

Current Readings: 2
Required Minimum: 5
Estimated Time: 1.5m

Data is collected every 30 seconds.
```

Progress cards show:
- ⚡ Current Readings
- 🎯 Required Minimum (5)
- ⏰ Estimated Time

---

## Color Coding

### Risk Levels
- 🟢 **LOW**: Green (safe conditions)
- 🟡 **MEDIUM**: Yellow (monitor closely)
- 🟠 **HIGH**: Orange (prepare for action)
- 🔴 **CRITICAL**: Red (immediate danger)

### Trend Indicators
- 🔴 **Increasing**: Red (concerning)
- 🟢 **Decreasing**: Green (improving)
- ⚪ **Stable**: Gray (no change)

---

## How Predictions Work

### Step 1: Collect Data
```
ESP32 → Backend → Last 20 readings
```

### Step 2: Analyze Trends
```
Linear Regression on each sensor
Calculate slope (rate of change)
Determine: increasing/decreasing/stable
```

### Step 3: Project Future
```
Future Value = Current + (Slope × Time)
Example: Soil 45% + (0.8%/min × 30min) = 69%
```

### Step 4: ML Prediction
```
Run RandomForest model on projected values
Output: Future risk level + confidence
```

### Step 5: Generate Warnings
```
Compare future risk to current risk
Flag if escalating
List concerning sensors
```

---

## Reading the Display

### Example Forecast Card

```
┌─────────────────────────────────────┐
│ ⏰ In 1 hour          🔴 [HIGH] ⬆  │
│                                     │
│ [MEDIUM] → [HIGH]                   │
│                                     │
│ Predicted Risk Score                │
│        78                           │
│ ████████████████████░░░  79.2%      │
│                                     │
│ PREDICTED VALUES                    │
│ Soil: 100%  Water: 127cm            │
│ Tilt: 3.6°  Vibration: 2            │
│                                     │
│ Forecast Confidence: 79.2%          │
└─────────────────────────────────────┘
```

**Interpretation:**
- In 1 hour, risk will become HIGH
- Risk is escalating (⬆ arrow)
- Red border = danger
- Soil will max out at 100%
- Water level will reach 127cm
- 79.2% confident in this forecast

---

## Refresh Rate

- **Real-time updates**: Via WebSocket (every 30 seconds)
- **Automatic recalculation**: On each new sensor reading
- **Manual refresh**: Reload page anytime

---

## Mobile Responsive

- **Desktop**: 3-column forecast grid
- **Tablet**: 2-column grid
- **Mobile**: Single column, full-width cards
- All features accessible on any device

---

## Navigation

### Quick Links
```
Dashboard    → Real-time monitoring
Predictions  → Trend forecasting (YOU ARE HERE)
Analytics    → Historical analysis  
Alerts       → Notification history
```

### Breadcrumb
```
Home > Predictions
```

---

## Use Cases

### 1. Routine Monitoring
Check predictions page daily to see if risk is trending upward.

### 2. Weather Events
During rainy season, monitor hourly for rapid changes.

### 3. Preventive Action
If 2-hour forecast shows HIGH, evacuate before conditions worsen.

### 4. False Alarm Check
If current risk is HIGH but forecasts show decreasing, situation may stabilize.

### 5. Early Warning
Warnings appear 30-120 minutes before risk becomes critical.

---

## Tips for Best Results

### ✅ Do This:
- Let system run continuously for accurate trends
- Check predictions during weather events
- Act on warnings immediately
- Monitor all 3 forecast intervals

### ❌ Avoid This:
- Don't ignore escalating warnings
- Don't rely on short-term data (<5 readings)
- Don't refresh too frequently (30s intervals)
- Don't trust predictions during power outages

---

## Technical Details

### Data Requirements
- **Minimum**: 5 historical readings
- **Optimal**: 20+ readings
- **Time span**: Last 10+ minutes
- **Interval**: Every 30 seconds

### Confidence Calculation
```javascript
forecast_confidence = ml_confidence × trend_confidence

Example:
- ML: 95%
- Trend: 85%
- Final: 80.75%
```

### Prediction Algorithm
```
1. Linear Regression (trend slope)
2. Value projection (extrapolation)
3. ML model inference (RandomForest)
4. Confidence adjustment
5. Warning generation
```

---

## Troubleshooting

### "Collecting Data" Message
- **Cause**: Less than 5 readings
- **Fix**: Wait 2-5 minutes, refresh page

### No Warnings Shown
- **Cause**: Risk is stable or decreasing
- **Fix**: This is good! No action needed

### Low Confidence (<50%)
- **Cause**: Irregular sensor data or insufficient history
- **Fix**: Check ESP32 connection, wait for more data

### Predictions Not Updating
- **Cause**: WebSocket disconnected
- **Fix**: Check connection status in header, reload page

---

## Keyboard Shortcuts

- `Ctrl/Cmd + R`: Refresh page
- `Ctrl/Cmd + W`: Close tab
- `Tab`: Navigate between sections
- `Esc`: Clear selection

---

## Comparison: Dashboard vs Predictions

| Feature | Dashboard | Predictions |
|---------|-----------|-------------|
| Current readings | ✅ Yes | ✅ Yes |
| Live charts | ✅ Yes | ❌ No |
| Risk indicator | ✅ Yes | ✅ Yes |
| Trend analysis | ❌ No | ✅ Yes |
| Future forecasts | ❌ No | ✅ Yes |
| Warnings | ❌ No | ✅ Yes |
| Detailed predictions | ❌ No | ✅ Yes |

**Recommendation**: Use Dashboard for real-time monitoring, use Predictions for planning and early warning.

---

## Future Enhancements

Planned features:
- [ ] Export forecasts as PDF
- [ ] SMS/Email alerts for warnings
- [ ] Historical forecast accuracy
- [ ] Custom time intervals (3hr, 6hr, 12hr)
- [ ] Weather integration
- [ ] Confidence intervals
- [ ] What-if scenarios

---

## Support

If predictions seem inaccurate:
1. Verify ESP32 sensor calibration
2. Check for consistent data intervals
3. Ensure at least 20 readings
4. Look for sensor errors in logs

For emergency situations:
- **Ignore predictions** if current sensors show immediate danger
- Trust current readings over forecasts
- Evacuate if any sensor shows critical levels

---

**Page Status**: ✅ Live and Active
**URL**: https://frontend-kappa-two-57.vercel.app/predictions
**Last Updated**: June 19, 2026
