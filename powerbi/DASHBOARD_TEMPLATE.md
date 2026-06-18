# Power BI Dashboard Template
## Landslide Monitoring System

## 📊 Dashboard Pages Overview

### Page 1: Executive Summary
**Purpose:** High-level overview for management

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  🎯 Current Risk Score: 34    🌡️ Avg Soil: 45.2%      │
│      MEDIUM RISK              💧 Avg Water: 32.1%      │
│                               📊 Total Alerts: 15       │
│  ┌──────────────────────┐    ⚡ Sensor Status: Good   │
│  │                      │                              │
│  │   Risk Gauge         │    ┌─────────────────────┐  │
│  │   (0-100)            │    │  Risk Distribution  │  │
│  │                      │    │  Donut Chart        │  │
│  └──────────────────────┘    └─────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Sensor Readings Trend (Last 24 Hours)          │  │
│  │  [Line Chart: Soil, Water, Tilt]                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Page 2: Real-Time Sensor Monitoring
**Purpose:** Detailed sensor data visualization

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Soil Moisture    │  Water Level   │  Tilt Angle        │
│  ┌──────────┐    │  ┌──────────┐  │  ┌──────────┐     │
│  │  45.2%   │    │  │  32.1%   │  │  │  5.4°    │     │
│  │  ━━━━━━━  │    │  │  ━━━━━━━  │  │  │  ━━━━━━━  │     │
│  └──────────┘    │  └──────────┘  │  └──────────┘     │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Soil Moisture Trend (7 Days)                    │  │
│  │  [Area Chart with Moving Average]                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌────────────────────┐  ┌────────────────────────┐  │
│  │ Water Level Trend  │  │ Tilt Angle Monitoring  │  │
│  │ [Line Chart]       │  │ [Line Chart]           │  │
│  └────────────────────┘  └────────────────────────┘  │
│                                                         │
│  ┌────────────────────┐  ┌────────────────────────┐  │
│  │ Vibration Activity │  │ Distance Measurement   │  │
│  │ [Bar Chart]        │  │ [Line Chart]           │  │
│  └────────────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Page 3: ML Model Performance
**Purpose:** Machine learning metrics and analysis

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Model Accuracy    │  Avg Confidence  │  Total Predictions│
│  ┌──────────┐     │  ┌──────────┐    │  ┌──────────┐    │
│  │  98.79%  │     │  │  95.6%   │    │  │  825     │    │
│  └──────────┘     │  └──────────┘    │  └──────────┘    │
│                                                          │
│  ┌────────────────────┐  ┌───────────────────────────┐ │
│  │ Model Usage        │  │ Confidence Distribution   │ │
│  │ [Donut Chart]      │  │ [Stacked Bar]             │ │
│  │ • RandomForest: 97%│  │ • High (>90%): 750       │ │
│  │ • Fallback: 3%     │  │ • Medium (70-90%): 50    │ │
│  └────────────────────┘  │ • Low (<70%): 25         │ │
│                          └───────────────────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Feature Importance                               │  │
│  │  ████████████████████████████ Water Level: 66.6% │  │
│  │  ████ Soil Moisture: 8.9%                        │  │
│  │  ████ Distance: 8.5%                             │  │
│  │  ███ Tilt: 8.0%                                  │  │
│  │  ███ Vibration: 8.0%                             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Prediction Confidence Over Time                  │  │
│  │  [Line Chart with Threshold Lines]                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Page 4: Risk Analytics
**Purpose:** Risk assessment and distribution

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  ┌────────────────────┐  ┌────────────────────────────┐│
│  │ Risk Distribution  │  │ Risk Level Breakdown       ││
│  │ [Donut Chart]      │  │ [Treemap]                  ││
│  │ • LOW: 78.79%      │  │ ┌──────┬──────┬──────┐    ││
│  │ • MEDIUM: 18.18%   │  │ │ LOW  │MEDIUM│ HIGH │    ││
│  │ • HIGH: 2.42%      │  │ │ 650  │ 150  │  20  │    ││
│  │ • CRITICAL: 0.61%  │  │ └──────┴──────┴──────┘    ││
│  └────────────────────┘  └────────────────────────────┘│
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Risk Score Over Time                             │  │
│  │  [Area Chart with Color Zones]                    │  │
│  │  Red Zone: 81-100 (Critical)                      │  │
│  │  Orange Zone: 61-80 (High)                        │  │
│  │  Yellow Zone: 31-60 (Medium)                      │  │
│  │  Green Zone: 0-30 (Low)                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  High-Risk Events Table                           │  │
│  │  Date       │ Risk Score │ Level    │ Soil │ Water│  │
│  │  2026-06-15 │     85     │ CRITICAL │ 80%  │ 95% │  │
│  │  2026-06-10 │     72     │ HIGH     │ 75%  │ 88% │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Page 5: Geographic Visualization
**Purpose:** Location-based monitoring

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  🗺️ Sensor Locations & Risk Zones                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                   │  │
│  │            [Interactive Map]                      │  │
│  │                                                   │  │
│  │  Legend:                                          │  │
│  │  🟢 Low Risk    🟡 Medium Risk                   │  │
│  │  🟠 High Risk   🔴 Critical Risk                 │  │
│  │                                                   │  │
│  │  Map Features:                                    │  │
│  │  • Bubble size = Risk Score                       │  │
│  │  • Color = Risk Level                             │  │
│  │  • Tooltip = All sensor values                    │  │
│  │                                                   │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────┐  ┌────────────────────────┐   │
│  │ Location Details   │  │ Risk by Location       │   │
│  │ [Table]            │  │ [Column Chart]         │   │
│  │ Lat  │ Lon │ Risk  │  │                        │   │
│  └────────────────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Page 6: Historical Analytics
**Purpose:** Long-term trends and patterns

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Time Period: [Dropdown: 7 Days / 30 Days / 90 Days]   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  30-Day Sensor Trends                             │  │
│  │  [Multi-line Chart]                                │  │
│  │  Lines: Soil Moisture, Water Level, Tilt          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────┐  ┌────────────────────────┐   │
│  │ Daily Alert Count  │  │ Risk Score Distribution│   │
│  │ [Stacked Bar]      │  │ [Histogram]            │   │
│  └────────────────────┘  └────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Sensor Correlation Matrix                        │  │
│  │         Soil  Water  Tilt  Vib   Dist   Risk     │  │
│  │  Soil   1.00  0.65  0.45  0.23  0.34   0.78      │  │
│  │  Water  0.65  1.00  0.56  0.12  0.45   0.85      │  │
│  │  Tilt   0.45  0.56  1.00  0.34  0.23   0.67      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Page 7: Alerts & Notifications
**Purpose:** Alert monitoring and management

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Total Alerts │ Unresolved │ High Severity │ Alert Rate │
│  ┌─────────┐ │ ┌────────┐ │ ┌──────────┐ │ ┌────────┐ │
│  │   25    │ │ │   5    │ │ │    8     │ │ │  3.0%  │ │
│  └─────────┘ │ └────────┘ │ └──────────┘ │ └────────┘ │
│                                                          │
│  ┌────────────────────┐  ┌────────────────────────┐   │
│  │ Alerts by Severity │  │ Alerts by Type         │   │
│  │ [Donut Chart]      │  │ [Bar Chart]            │   │
│  │ • HIGH: 8          │  │ • Soil High: 10        │   │
│  │ • MEDIUM: 10       │  │ • Water High: 8        │   │
│  │ • LOW: 7           │  │ • Tilt Detected: 7     │   │
│  └────────────────────┘  └────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Recent Alerts                                    │  │
│  │  Timestamp   │ Type         │ Severity │ Status  │  │
│  │  14:30:15    │ Water High   │ HIGH     │ Active  │  │
│  │  13:15:42    │ Soil High    │ MEDIUM   │ Resolved│  │
│  │  12:05:23    │ Tilt Detect  │ HIGH     │ Active  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Page 8: Automated Reports
**Purpose:** Daily/Weekly/Monthly summaries

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Report Type: [Daily Report]  Date: [2026-06-17]       │
│                                                          │
│  📊 DAILY SUMMARY                                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Metric              │ Value    │ Change from Prev│  │
│  │  ────────────────────┼──────────┼────────────────│  │
│  │  Avg Soil Moisture   │  45.23%  │  ↑ 2.3%       │  │
│  │  Avg Water Level     │  32.15%  │  ↓ 1.5%       │  │
│  │  Avg Tilt Angle      │   5.43°  │  ↑ 0.8°       │  │
│  │  Avg Risk Score      │  28.50   │  ↓ 3.2        │  │
│  │  Total Alerts        │    3     │  ↓ 2          │  │
│  │  Sensor Readings     │   48     │  → 0          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────┐  ┌────────────────────────┐   │
│  │ Daily Trend        │  │ Hourly Breakdown       │   │
│  │ [Line Chart]       │  │ [Column Chart]         │   │
│  └────────────────────┘  └────────────────────────┘   │
│                                                          │
│  📋 KEY EVENTS                                          │
│  • 14:30 - High water level alert triggered            │
│  • 12:05 - Tilt angle exceeded threshold               │
│  • 10:15 - ML model prediction: MEDIUM risk            │
│                                                          │
│  [Export to PDF] [Email Report] [Schedule]             │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme (Dark Theme)

```
Background Colors:
  - Primary Background: #0F172A
  - Card Background: #1E293B
  - Hover State: #334155

Text Colors:
  - Primary Text: #F8FAFC
  - Secondary Text: #CBD5E1
  - Disabled Text: #64748B

Data Colors:
  - Soil Moisture: #3B82F6 (Blue)
  - Water Level: #06B6D4 (Cyan)
  - Tilt Angle: #EAB308 (Yellow)
  - Vibration: #EF4444 (Red)
  - Distance: #A855F7 (Purple)
  - GPS: #22C55E (Green)

Risk Level Colors:
  - LOW: #22C55E (Green)
  - MEDIUM: #EAB308 (Yellow)
  - HIGH: #F97316 (Orange)
  - CRITICAL: #EF4444 (Red)

Border & Accent:
  - Border: #334155
  - Accent: #3B82F6
  - Grid Lines: #1E293B80 (50% opacity)
```

---

## 📐 Visual Specifications

### KPI Cards
```
Size: 200x150px
Font Size: 
  - Value: 48pt Bold
  - Label: 12pt Regular
Border: 2px solid #334155
Border Radius: 8px
Padding: 16px
Background: #1E293B
```

### Charts
```
Title Font: 16pt Segoe UI Semibold
Axis Labels: 12pt Segoe UI Regular
Grid Lines: Dashed, #1E293B80
Line Width: 3px
Point Markers: 6px
Legend: Bottom, 11pt
```

### Tables
```
Header: 14pt Bold, #F8FAFC on #334155
Row: 12pt Regular, Alternate row colors
  - Even: #1E293B
  - Odd: #0F172A
Border: 1px solid #334155
Padding: 12px
```

---

## 🔄 Refresh Schedule

```
Power BI Desktop:
  - Refresh Interval: 30 seconds
  - Auto-refresh: Enabled

Power BI Service:
  - Scheduled Refresh: Every 30 minutes
  - Incremental Refresh: Enabled
  - Cache: 15 minutes
```

---

## 📱 Mobile Optimization

### Mobile Layout Priority:
1. Current Risk Score (Large Card)
2. Sensor Health Status
3. Recent Sensor Readings (Compact Table)
4. Risk Distribution (Small Donut)
5. Latest Alerts (Scrollable List)

### Mobile Breakpoints:
```
Phone: < 768px
  - Single column
  - Stack all visuals
  - Simplified charts

Tablet: 768px - 1024px
  - Two column grid
  - Medium charts
  - Full tables

Desktop: > 1024px
  - Multi-column layouts
  - Full visuals
  - All features
```

---

This template provides a complete visual guide for building your Power BI dashboards!
