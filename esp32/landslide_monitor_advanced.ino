/*
 * ESP32 Landslide Monitoring - Advanced Version with WiFi
 * Sends data to cloud backend every 30 seconds
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TinyGPS++.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// ===== WiFi Configuration =====
const char* ssid = "YOUR_WIFI_SSID";           // Change this
const char* password = "YOUR_WIFI_PASSWORD";    // Change this

// ===== Backend API =====
const char* serverUrl = "https://landslide-api.onrender.com/api/sensor-data";

// ===== PINS =====
#define SOIL_PIN 34
#define WATER_PIN 35
#define VIB_PIN 26
#define TRIG_PIN 5
#define ECHO_PIN 18
#define BUZZER_PIN 25

// GPS
HardwareSerial gpsSerial(2);
TinyGPSPlus gps;

// MPU6050
Adafruit_MPU6050 mpu;

// ===== VARIABLES =====
bool vibrationDetected = false;
bool tiltDetected = false;
long duration;
float distance;

// Tilt calibration
float refX = 0, refY = 0;
bool calibrated = false;
int sampleCount = 0;

// Buzzer
unsigned long lastBeep = 0;
int beepCount = 0;
bool buzzerState = false;

// WiFi & Data sending
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 30000; // 30 seconds

void setup() {
  Serial.begin(115200);
  
  pinMode(VIB_PIN, INPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  gpsSerial.begin(9600, SERIAL_8N1, 4, 2);
  Wire.begin(21, 22);
  
  if (!mpu.begin()) {
    Serial.println("MPU6050 NOT detected ❌");
  } else {
    Serial.println("MPU6050 Connected ✅");
  }
  
  Serial.println("⚠️ Keep system still for 3–5 sec (calibration)");
  
  // Connect to WiFi
  connectWiFi();
}

void connectWiFi() {
  Serial.println("\n🌐 Connecting to WiFi...");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Connection Failed");
  }
}

void loop() {
  // Read all sensors
  int soil = analogRead(SOIL_PIN);
  int water = analogRead(WATER_PIN);
  
  // Water sensor error handling
  if (water >= 4000) {
    Serial.println("⚠️ Water sensor error / overflow");
    water = 0;
  }
  
  // Vibration
  vibrationDetected = digitalRead(VIB_PIN);
  
  // Ultrasonic
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  duration = pulseIn(ECHO_PIN, HIGH, 30000);
  
  if (duration == 0) distance = -1;
  else distance = duration * 0.034 / 2;
  
  // GPS
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }
  
  // MPU6050 Tilt
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  
  float angleX = atan(a.acceleration.x / sqrt(pow(a.acceleration.y, 2) + pow(a.acceleration.z, 2))) * 180 / PI;
  float angleY = atan(a.acceleration.y / sqrt(pow(a.acceleration.x, 2) + pow(a.acceleration.z, 2))) * 180 / PI;
  
  // Smoothing
  static float smoothX = 0;
  static float smoothY = 0;
  smoothX = 0.8 * smoothX + 0.2 * angleX;
  smoothY = 0.8 * smoothY + 0.2 * angleY;
  
  // Calibration
  if (!calibrated) {
    refX += smoothX;
    refY += smoothY;
    sampleCount++;
    if (sampleCount >= 30) {
      refX /= 30;
      refY /= 30;
      calibrated = true;
      Serial.println("✅ Tilt calibrated");
    }
    tiltDetected = false;
  } else {
    float changeX = abs(smoothX - refX);
    float changeY = abs(smoothY - refY);
    tiltDetected = (changeX > 12 || changeY > 12);
  }
  
  // Risk calculation
  String risk = "NORMAL";
  if (soil < 2000 || water > 1200 || distance < 20) {
    risk = "WARNING";
  }
  if (soil < 1500 || water > 1800 || vibrationDetected || tiltDetected || distance < 10) {
    risk = "CRITICAL";
  }
  
  // Buzzer logic
  if (risk == "CRITICAL") {
    digitalWrite(BUZZER_PIN, HIGH);
    beepCount = 0;
  }
  else if (risk == "WARNING") {
    if (beepCount < 4) {
      if (millis() - lastBeep > 300) {
        buzzerState = !buzzerState;
        digitalWrite(BUZZER_PIN, buzzerState);
        lastBeep = millis();
        beepCount++;
      }
    } else {
      digitalWrite(BUZZER_PIN, LOW);
    }
  }
  else {
    digitalWrite(BUZZER_PIN, LOW);
    beepCount = 0;
  }
  
  // Print to Serial
  Serial.println("------ DATA ------");
  Serial.print("Soil: "); Serial.println(soil);
  Serial.print("Water: "); Serial.println(water);
  Serial.print("Vibration: ");
  Serial.println(vibrationDetected ? "Detected 💥" : "No Activity");
  Serial.print("Tilt: ");
  Serial.println(tiltDetected ? "Tilted ⚠️" : "Stable");
  Serial.print("Distance: ");
  if (distance == -1) Serial.println("No Sensor");
  else {
    Serial.print(distance);
    Serial.println(" cm");
  }
  if (gps.location.isValid()) {
    Serial.print("Location: https://maps.google.com/?q=");
    Serial.print(gps.location.lat(), 6);
    Serial.print(",");
    Serial.println(gps.location.lng(), 6);
  } else {
    Serial.println("GPS: Waiting...");
  }
  Serial.print("🚨 Risk Level: ");
  Serial.println(risk);
  Serial.println("------------------\n");
  
  // Send data to cloud every 30 seconds
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= sendInterval) {
    sendDataToCloud(soil, water, distance, smoothX, smoothY, vibrationDetected, tiltDetected);
    lastSendTime = currentTime;
  }
  
  delay(500);
}

void sendDataToCloud(int soil, int water, float distance, float tiltX, float tiltY, bool vibration, bool tilt) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected. Reconnecting...");
    connectWiFi();
    return;
  }
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Convert raw sensor values to expected format
  // Soil moisture: map from 0-4095 to 0-100 (invert: lower reading = more moisture)
  float soilMoisture = map(soil, 0, 4095, 100, 0);
  if (soilMoisture < 0) soilMoisture = 0;
  if (soilMoisture > 100) soilMoisture = 100;
  
  // Water level: map from 0-4095 to 0-20 cm
  float waterLevel = map(water, 0, 4095, 0, 20);
  if (waterLevel < 0) waterLevel = 0;
  
  // Tilt angle: use magnitude of change from reference
  float tiltAngle = sqrt(pow(tiltX, 2) + pow(tiltY, 2));
  
  // Vibration: convert boolean to numeric (0 or 10)
  int vibrationValue = vibration ? 10 : 0;
  
  // Create JSON payload
  StaticJsonDocument<512> doc;
  doc["soilMoisture"] = soilMoisture;
  doc["waterLevel"] = waterLevel;
  doc["tilt"] = tiltAngle;
  doc["vibration"] = vibrationValue;
  doc["ultrasonicDistance"] = distance > 0 ? distance : 100;
  
  // GPS coordinates
  if (gps.location.isValid()) {
    doc["latitude"] = gps.location.lat();
    doc["longitude"] = gps.location.lng();
  } else {
    doc["latitude"] = 0.0;
    doc["longitude"] = 0.0;
  }
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("\n📡 Sending to cloud...");
  Serial.println(jsonString);
  
  // Send HTTP POST
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("✅ Data sent successfully! Response code: ");
    Serial.println(httpResponseCode);
    
    String response = http.getString();
    Serial.println("Response: " + response);
  } else {
    Serial.print("❌ Error sending data. Code: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}
