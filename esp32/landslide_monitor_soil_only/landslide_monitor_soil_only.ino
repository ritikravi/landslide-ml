/*
 * ESP32 Landslide Monitoring System
 * Full sensor suite with cloud upload
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <TinyGPS++.h>

const char* ssid = "Ritik";
const char* password = "rrrrrrrr";
const char* serverUrl = "https://landslide-api.onrender.com/api/sensor-data";

#define SOIL_PIN 34        // Soil moisture sensor
#define WATER_PIN 35       // Water level sensor  
#define VIBRATION_PIN 27   // Vibration sensor DO pin
#define GPS_RX_PIN 16      // GPS TX connects to ESP32 GPIO16
#define GPS_TX_PIN 17      // GPS RX connects to ESP32 GPIO17
#define TRIG_PIN 25        // Ultrasonic TRIG
#define ECHO_PIN 26        // Ultrasonic ECHO
#define SDA_PIN 21         // MPU6050 SDA
#define SCL_PIN 22         // MPU6050 SCL
const int MPU_ADDR = 0x68;

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 30000;
bool firstRun = true;
int vibrationCount = 0;  // Count vibrations in 30-second window

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);  // Use UART2

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n========================================");
  Serial.println("🌋 ESP32 Landslide Monitor Starting...");
  Serial.println("========================================\n");
  
  // Setup MPU6050
  Wire.begin(SDA_PIN, SCL_PIN);
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);  // Power management register
  Wire.write(0);     // Wake up MPU6050
  byte error = Wire.endTransmission(true);
  
  if (error == 0) {
    Serial.println("✅ MPU6050 tilt sensor initialized (GPIO21/22)");
  } else {
    Serial.println("⚠️  MPU6050 not found - continuing without tilt");
  }
  
  // Setup vibration sensor pin
  pinMode(VIBRATION_PIN, INPUT);
  Serial.println("✅ Vibration sensor initialized (GPIO27)");
  
  // Setup ultrasonic sensor pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.println("✅ Ultrasonic sensor initialized (GPIO25/26)");
  
  // Setup GPS
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println("✅ GPS module initialized (GPIO16/17)");
  Serial.println("⏳ Testing GPS for 5 seconds...\n");
  
  // Test GPS for 5 seconds
  unsigned long gpsTestStart = millis();
  int charsReceived = 0;
  
  while (millis() - gpsTestStart < 5000) {
    if (gpsSerial.available() > 0) {
      char c = gpsSerial.read();
      charsReceived++;
      gps.encode(c);
    }
  }
  
  Serial.println("========================================");
  Serial.println("🛰️  GPS CONNECTION TEST");
  Serial.println("========================================");
  Serial.print("Characters received: ");
  Serial.println(charsReceived);
  
  if (charsReceived == 0) {
    Serial.println("❌ GPS: No data (check wiring or go outside)");
  } else {
    Serial.println("✅ GPS: Receiving data!");
    Serial.print("Sentences: ");
    Serial.println(gps.sentencesWithFix());
  }
  Serial.println("========================================\n");
  
  connectWiFi();
  
  Serial.println("🚀 System ready! Reading sensors...\n");
}

void connectWiFi() {
  Serial.println("🌐 Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    Serial.println("");
  }
}

float readUltrasonicDistance() {
  // Send 10us pulse to TRIG
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read ECHO pulse duration
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  
  if (duration == 0) {
    return -1; // No echo received
  }
  
  // Calculate distance in cm (speed of sound = 343 m/s)
  float distance = duration * 0.0343 / 2;
  
  return distance;
}

void readMPU6050(float &pitch, float &roll) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);  // Accelerometer start register
  byte error = Wire.endTransmission(false);
  
  if (error != 0) {
    pitch = 0;
    roll = 0;
    return;
  }
  
  Wire.requestFrom(MPU_ADDR, 6, true);
  
  if (Wire.available() < 6) {
    pitch = 0;
    roll = 0;
    return;
  }
  
  int16_t AcX = Wire.read() << 8 | Wire.read();
  int16_t AcY = Wire.read() << 8 | Wire.read();
  int16_t AcZ = Wire.read() << 8 | Wire.read();
  
  float ax = AcX / 16384.0;
  float ay = AcY / 16384.0;
  float az = AcZ / 16384.0;
  
  // Raw angles
  float rawPitch = atan2(ay, az) * 180.0 / PI;
  float rawRoll  = atan2(-ax, sqrt(ay * ay + az * az)) * 180.0 / PI;
  
  // Raw angles are the actual sensor output
  // Use raw values directly — they show real physical tilt
  // At rest: Pitch=-135, Roll=35.26 (sensor mounting position)
  // We track CHANGE from rest position for landslide detection
  
  // Store calibration baseline (first reading)
  static float pitchBase = 0, rollBase = 0;
  static bool calibrated = false;
  
  if (!calibrated) {
    pitchBase = rawPitch;
    rollBase  = rawRoll;
    calibrated = true;
  }
  
  // Relative change from baseline — this is what matters for landslide
  pitch = rawPitch - pitchBase;
  roll  = rawRoll  - rollBase;
  
  // Wrap to [-180, 180]
  if (pitch >  180) pitch -= 360;
  if (pitch < -180) pitch += 360;
  if (roll  >  180) roll  -= 360;
  if (roll  < -180) roll  += 360;
}

void loop() {
  // Read GPS data
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }
  
  // Read ultrasonic distance sensor
  float distance = readUltrasonicDistance();
  
  // Read soil moisture sensor with averaging to reduce noise
  long soilSum = 0;
  for (int i = 0; i < 10; i++) {
    soilSum += analogRead(SOIL_PIN);
    delay(5);
  }
  int soilRaw = soilSum / 10;
  float soilMoisture = map(soilRaw, 2800, 1200, 0, 100);
  if (soilMoisture < 0) soilMoisture = 0;
  if (soilMoisture > 100) soilMoisture = 100;
  
  // Read water level sensor
  // GPIO35 is input-only with no internal pull-down
  // When disconnected it floats near 4095 (max ADC = 0% water)
  // Take 5 readings and average
  long waterSum = 0;
  for (int i = 0; i < 5; i++) {
    waterSum += analogRead(WATER_PIN);
    delay(10);
  }
  int waterAvg = waterSum / 5;

  float waterLevel = 0;
  // If raw value > 3800 (near max), sensor is likely disconnected or bone dry
  // Report as 0 when disconnected
  if (waterAvg > 3800) {
    waterLevel = 0;
  } else {
    // Normal range: 3800 (dry/air) to ~500 (fully submerged)
    waterLevel = map(waterAvg, 3800, 500, 0, 100);
    if (waterLevel < 0)   waterLevel = 0;
    if (waterLevel > 100) waterLevel = 100;
  }
  
  // Read vibration sensor
  int vibrationState = digitalRead(VIBRATION_PIN);
  bool vibrationDetected = (vibrationState == HIGH);
  
  // Count vibrations in the 30-second window
  if (vibrationDetected) {
    vibrationCount++;
  }
  
  // Read MPU6050 tilt sensor
  float pitch, roll;
  readMPU6050(pitch, roll);
  float tiltAngle = sqrt(pitch * pitch + roll * roll);
  
  // Get GPS data
  float latitude = 0.0;
  float longitude = 0.0;
  int satellites = 0;
  
  if (gps.location.isValid()) {
    latitude = gps.location.lat();
    longitude = gps.location.lng();
  }
  
  if (gps.satellites.isValid()) {
    satellites = gps.satellites.value();
  }
  
  Serial.println("------ SENSOR DATA ------");
  Serial.print("Distance: ");
  if (distance > 0) {
    Serial.print(distance, 1);
    Serial.println(" cm");
  } else {
    Serial.println("N/A");
  }
  
  Serial.print("Soil: ");
  Serial.print(soilMoisture, 1);
  Serial.println("%");
  
  Serial.print("Water Level: ");
  Serial.print(waterLevel, 1);
  Serial.println("%");
  
  Serial.print("Vibration: ");
  if (vibrationDetected) {
    Serial.println("⚠️  DETECTED!");
  } else {
    Serial.println("None");
  }
  Serial.print("Vibration Count (30s): ");
  Serial.println(vibrationCount);
  
  Serial.print("GPS: ");
  if (gps.location.isValid()) {
    Serial.print(latitude, 6);
    Serial.print(", ");
    Serial.print(longitude, 6);
    Serial.print(" (");
    Serial.print(satellites);
    Serial.println(" sats)");
  } else {
    Serial.print("Searching... (");
    Serial.print(satellites);
    Serial.print(" sats, ");
    Serial.print(gps.charsProcessed());
    Serial.print(" chars, ");
    Serial.print(gps.sentencesWithFix());
    Serial.println(" fixes)");
  }
  
  Serial.print("Tilt - Pitch: ");
  Serial.print(pitch, 2);
  Serial.print("°  Roll: ");
  Serial.print(roll, 2);
  Serial.print("°  Angle: ");
  Serial.print(tiltAngle, 2);
  Serial.println("°");
  
  Serial.println("-------------------------\n");
  
  unsigned long currentTime = millis();
  if (firstRun || (currentTime - lastSendTime >= sendInterval)) {
    if (WiFi.status() == WL_CONNECTED) {
      sendDataToCloud(soilMoisture, waterLevel, tiltAngle, vibrationCount, latitude, longitude, distance);
      
      // Reset count after sending
      vibrationCount = 0;
      
      lastSendTime = currentTime;
      firstRun = false;
    }
  }
  
  delay(2000);
}

void sendDataToCloud(float soilMoisture, float waterLevel, float tilt, int vibration, float latitude, float longitude, float distance) {
  Serial.println("📡 Sending to cloud...");
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(20000);
  
  StaticJsonDocument<300> doc;
  doc["soilMoisture"] = soilMoisture;
  doc["waterLevel"] = waterLevel;
  doc["tilt"] = tilt;
  doc["vibration"] = vibration;
  
  // Send distance if valid
  if (distance > 0) {
    doc["distance"] = distance;
    Serial.print("📏 Including distance: ");
    Serial.print(distance);
    Serial.println(" cm");
  } else {
    Serial.println("⚠️  Distance invalid, not sending");
  }
  
  // Only send GPS if we have a valid fix
  if (latitude != 0.0 && longitude != 0.0) {
    doc["latitude"] = latitude;
    doc["longitude"] = longitude;
  }
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.print("📤 JSON payload: ");
  Serial.println(jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("✅ Response: ");
    Serial.println(httpResponseCode);
    if (httpResponseCode == 201) {
      Serial.println("✅ Data saved!");
    }
  }
  
  http.end();
  Serial.println("-----------------------------\n");
}
