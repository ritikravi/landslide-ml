# 📡 ESP32 Setup Guide - Production Ready

Your backend is live! Now configure your ESP32 to send data to the cloud.

## 🔧 Hardware Requirements

- ESP32 38-pin development board
- Capacitive Soil Moisture Sensor v1.2
- USB cable for programming
- WiFi network (2.4GHz)

## 📝 Step 1: Update WiFi Credentials

Open `esp32/landslide_monitor.ino` and update:

```cpp
// Change these to your WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";        // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD"; // Your WiFi password
```

**Example:**
```cpp
const char* ssid = "Home_WiFi";
const char* password = "mypassword123";
```

## ✅ Step 2: Backend URL (Already Configured!)

The production URL is already set:
```cpp
const char* serverUrl = "https://landslide-api.onrender.com/api/sensor-data";
```

✅ **No changes needed here!**

## 🔌 Step 3: Hardware Connections

### Soil Moisture Sensor
```
VCC  → ESP32 3.3V
GND  → ESP32 GND
AOUT → ESP32 GPIO34
```

### Water Level Sensor (Optional)
```
VCC    → ESP32 3.3V
GND    → ESP32 GND
Signal → ESP32 GPIO35
```

### Tilt Sensor (Optional)
```
VCC    → ESP32 3.3V
GND    → ESP32 GND
X-axis → ESP32 GPIO32
```

### Vibration Sensor (Optional)
```
VCC → ESP32 3.3V
GND → ESP32 GND
DO  → ESP32 GPIO33
```

## 💻 Step 4: Upload Code to ESP32

### Install Arduino IDE
1. Download from: https://www.arduino.cc/en/software
2. Install for your operating system

### Add ESP32 Board Support
1. Open Arduino IDE
2. Go to **File → Preferences**
3. In "Additional Board Manager URLs", add:
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
4. Click **OK**
5. Go to **Tools → Board → Boards Manager**
6. Search for "ESP32"
7. Install **"ESP32 by Espressif Systems"**

### Install Required Libraries
1. Go to **Sketch → Include Library → Manage Libraries**
2. Search and install:
   - **ArduinoJson** (by Benoit Blanchon)
   - **WiFi** (comes with ESP32)
   - **HTTPClient** (comes with ESP32)

### Configure Board Settings
1. **Tools → Board** → Select **"ESP32 Dev Module"**
2. **Tools → Upload Speed** → **115200**
3. **Tools → CPU Frequency** → **240MHz**
4. **Tools → Flash Frequency** → **80MHz**
5. **Tools → Flash Mode** → **QIO**
6. **Tools → Flash Size** → **4MB**

### Upload Code
1. Connect ESP32 via USB
2. **Tools → Port** → Select your ESP32 port
   - macOS: `/dev/cu.usbserial-*` or `/dev/cu.SLAB_USBtoUART`
   - Windows: `COM3`, `COM4`, etc.
   - Linux: `/dev/ttyUSB0` or `/dev/ttyACM0`
3. Open `esp32/landslide_monitor.ino`
4. Update WiFi credentials (Step 1)
5. Click **Upload** button (→)
6. Wait for "Done uploading" message

### If Upload Fails:
- Hold **BOOT** button while uploading
- Try different USB cable (data, not charge-only)
- Check port selection
- Try different USB port

## 📊 Step 5: Monitor Serial Output

1. Go to **Tools → Serial Monitor**
2. Set baud rate to **115200**
3. You should see:
   ```
   Connecting to WiFi...
   ✅ WiFi Connected
   IP Address: 192.168.1.100
   Soil Moisture: 65.2%
   Water Level: 8.5 cm
   Tilt: 1.2°
   Vibration: 0
   ✅ Data sent successfully. Response code: 201
   ```

## 🌐 Step 6: Verify Data on Dashboard

1. Open your dashboard: https://frontend-kappa-two-57.vercel.app
2. Wait 30 seconds (ESP32 sends every 30 seconds)
3. Watch data appear in real-time! 🎉

## 🔧 Sensor Calibration

### Soil Moisture Sensor
Test in different conditions:
- **Dry soil**: Should read ~0-30%
- **Moist soil**: Should read ~30-70%
- **Wet soil**: Should read ~70-100%

If values are off, adjust the mapping in code:
```cpp
// In readSoilMoisture() function
float moisture = map(rawValue, 0, 4095, 0, 100);
// Adjust min/max values based on your sensor
```

### GPS Coordinates
Update your location in the code:
```cpp
doc["latitude"] = 30.97;   // Your latitude
doc["longitude"] = 76.52;  // Your longitude
```

Get your coordinates from Google Maps: Right-click → "What's here?"

## 🐛 Troubleshooting

### WiFi Won't Connect
**Check:**
- SSID and password are correct
- Using 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- WiFi signal is strong enough
- No special characters in password

**Solution:** Add Serial.println statements to debug:
```cpp
Serial.print("Attempting to connect to: ");
Serial.println(ssid);
```

### HTTP POST Fails
**Check Serial Monitor for error codes:**
- **-1**: Connection failed
- **400**: Bad request (check data format)
- **401**: Unauthorized
- **404**: Wrong URL
- **500**: Server error

**Solution:**
- Verify backend URL is correct
- Check backend is running (test with curl)
- Ensure data format matches API expectations

### Data Not Appearing on Dashboard
**Checklist:**
- ✅ ESP32 shows "Data sent successfully"
- ✅ Backend is awake (first request takes 30-60s on free tier)
- ✅ Dashboard shows "Connected" status
- ✅ No CORS errors in browser console

**Solution:** 
- Check Render logs for incoming requests
- Verify CORS is updated in Render
- Test backend directly with curl

## 📈 Data Sending Schedule

Current configuration:
- **Interval**: 30 seconds
- **Sensors**: All connected sensors
- **Format**: JSON

To change interval, modify:
```cpp
const unsigned long sendInterval = 30000; // Change to desired milliseconds
// 60000 = 1 minute
// 300000 = 5 minutes
```

## ⚡ Power Consumption

For battery-powered deployments:
- Deep sleep between readings
- Send data every 5-15 minutes instead of 30 seconds
- Disable WiFi when not transmitting

## 🎯 Testing Without Hardware

Want to test without sensors? Use the curl command:

```bash
curl -X POST https://landslide-api.onrender.com/api/sensor-data \
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
```

Watch it appear on your dashboard instantly!

## 🎉 Success Checklist

- [ ] WiFi credentials updated
- [ ] Backend URL verified
- [ ] Sensors connected to correct GPIO pins
- [ ] Code uploaded to ESP32
- [ ] Serial monitor shows "Data sent successfully"
- [ ] Dashboard displays sensor data
- [ ] Real-time updates working
- [ ] Alerts generating (if thresholds exceeded)

## 📧 Need Help?

- Check Serial Monitor for error messages
- Test backend URL with curl
- Verify dashboard is showing "Connected"
- Check GitHub Issues for common problems

Happy monitoring! 🌍📡
