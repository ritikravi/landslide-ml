/*
 * ESP32 Landslide Monitoring System
 * Sensors: Soil Moisture | Water Level | Vibration | MPU6050 Tilt
 * Extras:  Ultrasonic Distance | GPS | WiFi Cloud Upload
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <TinyGPS++.h>

// ── WiFi & Server ─────────────────────────────────────────
const char* ssid      = "Ritik";
const char* password  = "rrrrrrrr";
const char* serverUrl = "https://landslide-api.onrender.com/api/sensor-data";

// ── Pin Definitions ───────────────────────────────────────
#define SOIL_PIN       34   // Soil moisture (analog)
#define WATER_PIN      35   // Water level   (analog)
#define VIBRATION_PIN  27   // Vibration     (digital)
#define TRIG_PIN       25   // Ultrasonic TRIG
#define ECHO_PIN       26   // Ultrasonic ECHO
#define SDA_PIN        21   // MPU6050 SDA
#define SCL_PIN        22   // MPU6050 SCL
#define GPS_RX_PIN     16   // GPS TX → ESP32 RX
#define GPS_TX_PIN     17   // GPS RX → ESP32 TX

// ── MPU6050 ───────────────────────────────────────────────
const int MPU_ADDR = 0x68;
bool mpuFound = false;
float pitchBase = 0, rollBase = 0;
bool mpuCalibrated = false;

// ── Timing ────────────────────────────────────────────────
unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL = 30000; // 30 seconds
bool firstRun = true;

// ── Vibration counter ────────────────────────────────────
int vibrationCount = 0;

// ── GPS ───────────────────────────────────────────────────
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);

// ─────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\n========================================");
  Serial.println(" ESP32 Landslide Monitor Starting");
  Serial.println("========================================\n");

  // ── MPU6050 init ──────────────────────────────────────
  Wire.begin(SDA_PIN, SCL_PIN);
  delay(200);

  // Try address 0x68 then 0x69
  for (int addr : {0x68, 0x69}) {
    Wire.beginTransmission(addr);
    Wire.write(0x6B);
    Wire.write(0x00); // Wake up
    if (Wire.endTransmission(true) == 0) {
      mpuFound = true;
      // Override MPU_ADDR effectively by using the found address
      Serial.print("✅ MPU6050 found at 0x");
      Serial.println(addr, HEX);
      break;
    }
  }
  if (!mpuFound) Serial.println("⚠️  MPU6050 not found — check SDA/SCL wiring");

  // ── Other sensors ────────────────────────────────────
  pinMode(VIBRATION_PIN, INPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.println("✅ Vibration, Ultrasonic, Soil, Water sensors ready");

  // ── GPS init ─────────────────────────────────────────
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println("✅ GPS initialized");

  // ── WiFi ─────────────────────────────────────────────
  connectWiFi();

  Serial.println("\n🚀 All systems ready. Collecting data...\n");
}

// ─────────────────────────────────────────────────────────
void connectWiFi() {
  Serial.print("🌐 Connecting to WiFi");
  WiFi.disconnect(true);
  delay(200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 30) {
    delay(500);
    Serial.print(".");
    tries++;
    yield();
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" ✅");
    Serial.print("   IP: "); Serial.println(WiFi.localIP());
  } else {
    Serial.println(" ❌ WiFi failed — will retry next cycle");
  }
}

// ─────────────────────────────────────────────────────────
int readAvg(int pin, int samples = 10) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delay(5);
  }
  return sum / samples;
}

// ─────────────────────────────────────────────────────────
float readSoilMoisture() {
  int raw = readAvg(SOIL_PIN);
  // Dry=2800(0%) Wet=1200(100%) — adjust if needed
  float pct = (float)(2800 - raw) / (2800 - 1200) * 100.0;
  return constrain(pct, 0, 100);
}

// ─────────────────────────────────────────────────────────
float readWaterLevel() {
  int raw = readAvg(WATER_PIN);
  // GPIO35 floats ~4095 when disconnected (no internal pull-down)
  if (raw > 3800) return 0;
  float pct = (float)(3800 - raw) / (3800 - 500) * 100.0;
  return constrain(pct, 0, 100);
}

// ─────────────────────────────────────────────────────────
float readUltrasonic() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long dur = pulseIn(ECHO_PIN, HIGH, 30000);
  if (dur == 0) return -1;
  return dur * 0.0343 / 2.0;
}

// ─────────────────────────────────────────────────────────
void readMPU6050(float &pitch, float &roll) {
  if (!mpuFound) { pitch = 0; roll = 0; return; }

  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  if (Wire.endTransmission(false) != 0) { pitch = 0; roll = 0; return; }
  Wire.requestFrom(MPU_ADDR, 6, true);
  if (Wire.available() < 6)             { pitch = 0; roll = 0; return; }

  int16_t AcX = Wire.read() << 8 | Wire.read();
  int16_t AcY = Wire.read() << 8 | Wire.read();
  int16_t AcZ = Wire.read() << 8 | Wire.read();

  float ax = AcX / 16384.0;
  float ay = AcY / 16384.0;
  float az = AcZ / 16384.0;

  float rawPitch = atan2(ay, az)                        * 180.0 / PI;
  float rawRoll  = atan2(-ax, sqrt(ay*ay + az*az))      * 180.0 / PI;

  // Auto-calibrate on first valid reading
  if (!mpuCalibrated) {
    pitchBase    = rawPitch;
    rollBase     = rawRoll;
    mpuCalibrated = true;
    Serial.println("✅ MPU6050 calibrated (baseline set)");
  }

  pitch = rawPitch - pitchBase;
  roll  = rawRoll  - rollBase;

  // Wrap to [-180, 180]
  if (pitch >  180) pitch -= 360;
  if (pitch < -180) pitch += 360;
  if (roll  >  180) roll  -= 360;
  if (roll  < -180) roll  += 360;
}

// ─────────────────────────────────────────────────────────
void loop() {
  // Feed GPS parser
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }
  yield();

  // ── Read all sensors ──────────────────────────────────
  float soil     = readSoilMoisture();
  float water    = readWaterLevel();
  float dist     = readUltrasonic();

  // Vibration — count events
  if (digitalRead(VIBRATION_PIN) == HIGH) vibrationCount++;

  float pitch, roll;
  readMPU6050(pitch, roll);
  float tilt = sqrt(pitch * pitch + roll * roll);

  float lat = 0, lng = 0;
  int   sats = 0;
  if (gps.location.isValid()) { lat = gps.location.lat(); lng = gps.location.lng(); }
  if (gps.satellites.isValid()) sats = gps.satellites.value();

  // ── Serial output ─────────────────────────────────────
  Serial.println("------ SENSOR DATA ------");
  Serial.printf("Soil Moisture:  %.1f%%\n",   soil);
  Serial.printf("Water Level:    %.1f%%\n",   water);
  if (dist > 0) Serial.printf("Distance:       %.1f cm\n", dist);
  else          Serial.println("Distance:       N/A");
  Serial.printf("Vibration:      %s (count: %d)\n",
    digitalRead(VIBRATION_PIN) == HIGH ? "DETECTED" : "None", vibrationCount);
  Serial.printf("Tilt Angle:     %.2f° (P:%.2f R:%.2f)\n", tilt, pitch, roll);
  if (gps.location.isValid())
    Serial.printf("GPS:            %.6f, %.6f (%d sats)\n", lat, lng, sats);
  else
    Serial.printf("GPS:            Searching (%d sats, %lu chars)\n",
      sats, gps.charsProcessed());
  Serial.println("-------------------------\n");

  // ── Cloud upload every 30 seconds ────────────────────
  unsigned long now = millis();
  if (firstRun || (now - lastSendTime >= SEND_INTERVAL)) {
    if (WiFi.status() == WL_CONNECTED) {
      sendToCloud(soil, water, tilt, vibrationCount, lat, lng, dist);
      vibrationCount = 0;
      lastSendTime   = now;
      firstRun       = false;
    } else {
      Serial.println("⚠️  WiFi disconnected — reconnecting...");
      connectWiFi();
    }
  }

  delay(2000);
}

// ─────────────────────────────────────────────────────────
void sendToCloud(float soil, float water, float tilt, int vib,
                 float lat, float lng, float dist) {
  Serial.println("📡 Sending to cloud...");
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(20000);

  StaticJsonDocument<300> doc;
  doc["soilMoisture"] = soil;
  doc["waterLevel"]   = water;
  doc["tilt"]         = tilt;
  doc["vibration"]    = vib;
  if (dist > 0)                    doc["distance"]  = dist;
  if (lat != 0.0 && lng != 0.0) { doc["latitude"] = lat; doc["longitude"] = lng; }

  String body;
  serializeJson(doc, body);
  Serial.print("📤 "); Serial.println(body);

  int code = http.POST(body);
  if (code == 201) Serial.println("✅ Data saved!");
  else             Serial.printf("⚠️  HTTP %d\n", code);

  http.end();
  Serial.println();
}
