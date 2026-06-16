/*
 * ESP32 Landslide Monitoring System
 * Full sensor suite with cloud upload
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
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

void loop() {
  // Read GPS data
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }
  
  // Read ultrasonic distance sensor
  float distance = readUltrasonicDistance();
  
  // Read soil moisture sensor
  int soilRaw = analogRead(SOIL_PIN);
  float soilMoisture = map(soilRaw, 2800, 1200, 0, 100);
  if (soilMoisture < 0) soilMoisture = 0;
  if (soilMoisture > 100) soilMoisture = 100;
  
  // Read water level sensor
  int waterRaw = analogRead(WATER_PIN);
  // INVERTED: High reading (dry) = 0%, Low reading (wet) = 100%
  float waterLevel = map(waterRaw, 4095, 0, 0, 100);  // Inverted mapping
  if (waterLevel < 0) waterLevel = 0;
  if (waterLevel > 100) waterLevel = 100;
  
  // Read vibration sensor
  int vibrationState = digitalRead(VIBRATION_PIN);
  bool vibrationDetected = (vibrationState == HIGH);
  
  // Count vibrations in the 30-second window
  if (vibrationDetected) {
    vibrationCount++;
  }
  
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
  
  Serial.println("-------------------------\n");
  
  unsigned long currentTime = millis();
  if (firstRun || (currentTime - lastSendTime >= sendInterval)) {
    if (WiFi.status() == WL_CONNECTED) {
      sendDataToCloud(soilMoisture, waterLevel, vibrationCount, latitude, longitude, distance);
      
      // Reset count after sending
      vibrationCount = 0;
      
      lastSendTime = currentTime;
      firstRun = false;
    }
  }
  
  delay(2000);
}

void sendDataToCloud(float soilMoisture, float waterLevel, int vibration, float latitude, float longitude, float distance) {
  Serial.println("📡 Sending to cloud...");
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(20000);
  
  StaticJsonDocument<300> doc;
  doc["soilMoisture"] = soilMoisture;
  doc["waterLevel"] = waterLevel;
  doc["tilt"] = 0;  // Tilt sensor disabled
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
