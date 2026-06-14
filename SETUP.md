# Complete Setup Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Local Development Setup](#local-development-setup)
3. [Docker Setup](#docker-setup)
4. [ESP32 Hardware Setup](#esp32-hardware-setup)
5. [ML Pipeline Setup](#ml-pipeline-setup)
6. [GitHub Repository Setup](#github-repository-setup)
7. [Troubleshooting](#troubleshooting)

## System Requirements

### Software
- **Node.js**: 18.x or higher
- **MongoDB**: 6.x or higher
- **Python**: 3.8 or higher (for ML)
- **Docker** (optional): Latest version
- **Git**: Latest version

### Hardware (Optional)
- ESP32 38-pin development board
- Capacitive Soil Moisture Sensor v1.2
- HW-290 Tilt Sensor
- SW-420 Vibration Sensor
- HC-SR04P Ultrasonic Sensor
- Water Level Sensor v1.1
- NEO-9M GPS Module
- Jumper wires and breadboard

## Local Development Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/landslide-monitoring.git
cd landslide-monitoring
```

### Step 2: Install MongoDB

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Windows:**
Download from [MongoDB Official Site](https://www.mongodb.com/try/download/community)

### Step 3: Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/landslide-monitoring
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

Backend should be running on `http://localhost:5000`

### Step 4: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend should be running on `http://localhost:5173`

### Step 5: Verify Installation

Visit `http://localhost:5173` - you should see the dashboard (empty initially).

Test API health:
```bash
curl http://localhost:5000/health
```

## Docker Setup

### Quick Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services:**
- MongoDB: `localhost:27017`
- Backend API: `localhost:5000`
- Frontend: `localhost:3000`

### Individual Service Commands

```bash
# Rebuild specific service
docker-compose build backend

# Restart service
docker-compose restart frontend

# View service logs
docker-compose logs -f backend
```

## ESP32 Hardware Setup

### Hardware Connections

**Soil Moisture Sensor:**
- VCC → 3.3V
- GND → GND
- AOUT → GPIO34

**Water Level Sensor:**
- VCC → 3.3V
- GND → GND
- Signal → GPIO35

**Tilt Sensor (HW-290):**
- VCC → 3.3V
- GND → GND
- X-axis → GPIO32

**Vibration Sensor (SW-420):**
- VCC → 3.3V
- GND → GND
- DO → GPIO33

### Software Setup

1. **Install Arduino IDE**
   - Download from [arduino.cc](https://www.arduino.cc/en/software)

2. **Install ESP32 Board**
   - File → Preferences
   - Add URL: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools → Board → Boards Manager
   - Search "ESP32" and install

3. **Install Libraries**
   - Sketch → Include Library → Manage Libraries
   - Install: `ArduinoJson`

4. **Configure ESP32 Code**

Edit `esp32/landslide_monitor.ino`:

```cpp
// Update WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Update backend URL (use your computer's IP)
const char* serverUrl = "http://192.168.1.100:5000/api/sensor-data";

// Update GPS coordinates
doc["latitude"] = 30.97;  // Your location
doc["longitude"] = 76.52;
```

5. **Upload to ESP32**
   - Connect ESP32 via USB
   - Tools → Board → ESP32 Dev Module
   - Tools → Port → Select your port
   - Click Upload

6. **Monitor Serial Output**
   - Tools → Serial Monitor
   - Baud Rate: 115200

## ML Pipeline Setup

### Install Python Dependencies

```bash
cd ml
pip install -r requirements.txt
```

Or using virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Prepare Dataset

After collecting sensor data for a few days:

```bash
python training/prepare_dataset.py
```

This generates `datasets/sensor_data.csv`

### Train Model

```bash
python training/train_model.py
```

This creates trained models in `models/` directory.

## GitHub Repository Setup

### Initialize Git

```bash
# Initialize repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Landslide Monitoring System"
```

### Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click "New Repository"
3. Name it: `landslide-monitoring`
4. Don't initialize with README (we already have one)
5. Click "Create Repository"

### Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/landslide-monitoring.git

# Push code
git branch -M main
git push -u origin main
```

### Repository Settings

**Add Topics:**
- `iot`
- `esp32`
- `mern-stack`
- `landslide-monitoring`
- `mongodb`
- `react`
- `socket-io`
- `machine-learning`

**Add Description:**
```
Real-time IoT landslide monitoring system using ESP32, MERN stack, and ML for early warning
```

**Enable GitHub Actions:**
The CI/CD workflow in `.github/workflows/ci.yml` will automatically run on push.

## Troubleshooting

### Backend Issues

**MongoDB Connection Failed:**
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
# Windows: net start MongoDB
```

**Port Already in Use:**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process or change PORT in .env
```

### Frontend Issues

**npm install fails:**
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Vite not starting:**
```bash
# Check port 5173 availability
# Change port in vite.config.js if needed
```

### ESP32 Issues

**Upload Failed:**
- Hold BOOT button while uploading
- Check USB cable (use data cable, not charge-only)
- Try different USB port
- Check board and port selection

**WiFi Connection Failed:**
- Double-check SSID and password
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Check WiFi signal strength

**HTTP POST Failed:**
- Use computer's local IP (not localhost)
- Check firewall settings
- Ensure backend is running
- Verify URL format

### Docker Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**MongoDB connection from container:**
```bash
# Use service name, not localhost
MONGODB_URI=mongodb://mongodb:27017/landslide-monitoring
```

## Testing the System

### 1. Test Backend API

```bash
# Health check
curl http://localhost:5000/health

# Submit test data
curl -X POST http://localhost:5000/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{
    "soilMoisture": 75,
    "waterLevel": 12,
    "tilt": 2.5,
    "vibration": 1,
    "ultrasonicDistance": 98,
    "latitude": 30.97,
    "longitude": 76.52
  }'

# Get latest data
curl http://localhost:5000/api/sensor-data/latest
```

### 2. Test Frontend

- Open `http://localhost:5173`
- Check real-time connection status (top-right)
- Submit data via API (see above)
- Watch dashboard update automatically

### 3. Test Real-Time Updates

Open browser console on dashboard, then submit data via API.
You should see WebSocket events in console.

## Next Steps

1. ✅ Set up development environment
2. ✅ Test backend and frontend
3. ✅ Configure ESP32 hardware
4. ✅ Push to GitHub
5. 📊 Collect data for 1-2 weeks
6. 🤖 Train ML model
7. 🚀 Deploy to production
8. 📱 Build mobile app (future)

## Support

- **Issues**: Open GitHub issue
- **Discussions**: Use GitHub Discussions
- **Documentation**: Read code comments

Happy monitoring! 🌍📡
