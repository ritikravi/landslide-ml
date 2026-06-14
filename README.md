# 🌍 Landslide Monitoring and Early Warning System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6+-green.svg)](https://www.mongodb.com/)

A production-ready MERN stack IoT application for real-time landslide monitoring using ESP32 sensor nodes. Built for IIT-level research and deployment.

![Dashboard Preview](https://via.placeholder.com/800x400/0f172a/3b82f6?text=Landslide+Monitoring+Dashboard)

## ✨ Features

- 📡 **Real-time sensor data** collection from ESP32 nodes
- 📊 **Live dashboard** with WebSocket updates
- 📈 **Historical data visualization** with interactive charts
- 🚨 **Automated alert generation** based on sensor thresholds
- 🤖 **ML-ready data architecture** for predictive modeling
- 🎯 **Risk assessment engine** with weighted scoring
- 🎨 **Responsive dark theme UI** with glassmorphism design
- 🐳 **Docker deployment** ready

## 🏗️ Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS for styling
- Recharts for data visualization
- Socket.IO Client for real-time updates
- Lucide React for icons

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO for WebSocket communication
- Express Validator for data validation
- Helmet + Rate Limiting for security

### IoT Hardware
- ESP32 38-pin board
- Capacitive Soil Moisture Sensor v1.2
- HW-290 Tilt Sensor
- SW-420 Vibration Sensor
- HC-SR04P Ultrasonic Sensor
- Water Level Sensor v1.1
- NEO-9M GPS Module

### ML Pipeline (Future)
- Python 3.8+
- Scikit-learn (Random Forest)
- Pandas + NumPy
- TensorFlow Lite

## 🌐 Live Demo

- **Frontend**: [https://landslide-monitoring.vercel.app](https://landslide-monitoring.vercel.app) *(Deploy yours!)*
- **Backend API**: [https://landslide-api.onrender.com](https://landslide-api.onrender.com) *(Deploy yours!)*

## 🚀 Quick Start

### Option 1: Use Deployed Version (Easiest)

Follow [DEPLOYMENT.md](DEPLOYMENT.md) to deploy on:
- **Frontend**: Vercel (Free)
- **Backend**: Render (Free)
- **Database**: MongoDB Atlas (Free)

### Option 2: Local Development

#### Prerequisites

- Node.js 18 or higher
- MongoDB 6 or higher
- Python 3.8+ (for ML features)
- ESP32 board with sensors (optional)

#### 1️⃣ Clone Repository

```bash
git clone https://github.com/ritikravi/landslide-ml.git
cd landslide-ml
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev
```

**Environment Variables:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/landslide-monitoring
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Access the dashboard at `http://localhost:5173`

### 4️⃣ Docker Deployment (Recommended)

```bash
docker-compose up -d
```

This starts:
- MongoDB on port 27017
- Backend API on port 5000
- Frontend on port 3000

## 📡 ESP32 Integration

### Hardware Setup

1. Connect sensors to ESP32 according to pin configuration
2. Update WiFi credentials in `esp32/landslide_monitor.ino`
3. Update backend server IP address
4. Upload code to ESP32 using Arduino IDE

### Data Format

ESP32 sends POST requests to `/api/sensor-data` every 30 seconds:

```json
{
  "soilMoisture": 72.5,
  "waterLevel": 10.2,
  "tilt": 1.4,
  "vibration": 0,
  "ultrasonicDistance": 100.5,
  "latitude": 30.97,
  "longitude": 76.52
}
```

## 📚 API Documentation

### Sensor Data Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sensor-data` | Submit new sensor readings |
| GET | `/api/sensor-data/latest` | Get most recent reading |
| GET | `/api/sensor-data/history` | Get historical data (query: limit, startDate, endDate) |

### Alert Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get all alerts (query: limit, unresolved) |
| POST | `/api/alerts` | Create manual alert |
| PATCH | `/api/alerts/:id/resolve` | Mark alert as resolved |

### ML Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ml/predictions` | Get prediction history |
| GET | `/api/ml/predictions/latest` | Get latest risk prediction |

## 🎯 Risk Assessment Algorithm

The system calculates landslide risk scores using weighted sensor values:

```
Risk Score = (soilMoisture × 0.35) + (waterLevel × 0.25) + 
             (tilt × 0.20) + (vibration × 0.10) + (displacement × 0.10)
```

**Risk Levels:**
- 0-30: LOW ✅
- 31-60: MEDIUM ⚠️
- 61-80: HIGH 🔶
- 81-100: CRITICAL 🚨

## 🤖 Machine Learning Pipeline

### Data Preparation

```bash
cd ml
pip install -r requirements.txt
python training/prepare_dataset.py
```

### Model Training

```bash
python training/train_model.py
```

**Features Extracted:**
- Current sensor readings
- Moisture/tilt change rates
- Rolling averages
- Vibration frequency
- Surface displacement trends

## 📂 Project Structure

```
landslide-monitoring/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Validation & error handling
│   │   ├── socket/            # WebSocket handlers
│   │   └── config/            # Database config
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   └── context/           # Socket context
│   ├── package.json
│   └── Dockerfile
├── ml/
│   ├── training/              # ML training scripts
│   ├── datasets/              # Generated datasets
│   └── models/                # Trained models
├── esp32/
│   └── landslide_monitor.ino # Arduino code
├── docker-compose.yml
└── README.md
```

## 🔐 Security Features

- Helmet.js for HTTP headers security
- Rate limiting (100 requests/minute)
- Input validation with Express Validator
- CORS configuration
- Environment variable management
- Error handling middleware

## 🎨 Dashboard Features

### Overview Page
- Real-time sensor value cards
- Risk indicator with color-coded alerts
- Live updating charts
- GPS status monitoring

### Analytics Page
- Historical data comparison
- Multi-sensor bar charts
- Time range filtering (24h, 7d, 30d)
- Statistical summaries

### Alerts Page
- Alert history with severity levels
- Filter by resolved/unresolved
- One-click alert resolution
- Real-time alert notifications

## 🛠️ Development

### Run in Development Mode

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Build for Production

**Backend:**
```bash
npm start
```

**Frontend:**
```bash
npm run build
npm run preview
```

## 🧪 Testing

### Test ESP32 Connection

Send a test request:
```bash
curl -X POST http://localhost:5000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 65,
    "waterLevel": 8,
    "tilt": 2.1,
    "vibration": 0,
    "ultrasonicDistance": 95,
    "latitude": 30.97,
    "longitude": 76.52
  }'
```

## 🚧 Roadmap

- [ ] Random Forest classifier implementation
- [ ] TensorFlow Lite model deployment
- [ ] Multi-node sensor network support
- [ ] Historical data export (CSV/PDF)
- [ ] Email/SMS alert notifications
- [ ] Mobile app (React Native)
- [ ] Advanced data analytics
- [ ] Weather API integration
- [ ] Predictive maintenance alerts

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Built with ❤️ for landslide monitoring and early warning systems

## 🙏 Acknowledgments

- IIT research guidelines
- ESP32 community
- MERN stack developers
- Open source contributors

## 📧 Contact & Support

- Open an issue for bug reports
- Start a discussion for questions
- Pull requests are welcome!

---

**⭐ Star this repo if you find it useful!**
