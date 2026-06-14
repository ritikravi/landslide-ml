/*
 * ESP32 Landslide Monitoring Sensor Node
 * Sends sensor data to backend via HTTP POST
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend API endpoint
const char* serverUrl = "http://YOUR_BACKEND_IP:5000/api/sensor-data";

// Sensor pins
const int SOIL_MOISTURE_PIN = 34;
const int WATER_LEVEL_PIN = 35;
const int TILT_X_PIN = 32;
const int VIBRATION_PIN = 33;

// Timing
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 30000; // 30 seconds

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  Serial.println("✅ WiFi Connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  unsigned long currentTime = millis();
  
  if (currentTime - lastSendTime >= sendInterval) {
    // Read sensors
    float soilMoisture = readSoilMoisture();
    float waterLevel = readWaterLevel();
    float tilt = readTilt();
    int vibration = readVibration();
    
    // Send data
    sendSensorData(soilMoisture, waterLevel, tilt, vibration);
    
    lastSendTime = currentTime;
  }
  
  delay(100);
}

float readSoilMoisture() {
  // Read capacitive soil moisture sensor
  int rawValue = analogRead(SOIL_MOISTURE_PIN);
  
  // Map to percentage (calibrate these values for your sensor)
  float moisture = map(rawValue, 0, 4095, 0, 100);
  
  Serial.print("Soil Moisture: ");
  Serial.print(moisture);
  Serial.println("%");
  
  return moisture;
}

float readWaterLevel() {
  // Read water level sensor
  int rawValue = analogRead(WATER_LEVEL_PIN);
  float waterLevel = (rawValue / 4095.0) * 20.0; // Scale to cm
  
  Serial.print("Water Level: ");
  Serial.print(waterLevel);
  Serial.println(" cm");
  
  return waterLevel;
}

float readTilt() {
  // Read tilt sensor (analog)
  int rawValue = analogRead(TILT_X_PIN);
  float tilt = (rawValue / 4095.0) * 10.0; // Scale to degrees
  
  Serial.print("Tilt: ");
  Serial.print(tilt);
  Serial.println("°");
  
  return tilt;
}

int readVibration() {
  // Read vibration sensor (digital)
  int vibration = digitalRead(VIBRATION_PIN);
  
  Serial.print("Vibration: ");
  Serial.println(vibration);
  
  return vibration;
}

void sendSensorData(float soilMoisture, float waterLevel, float tilt, int vibration) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected");
    return;
  }
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["soilMoisture"] = soilMoisture;
  doc["waterLevel"] = waterLevel;
  doc["tilt"] = tilt;
  doc["vibration"] = vibration;
  doc["ultrasonicDistance"] = 100; // Placeholder
  doc["latitude"] = 30.97; // Add your GPS coordinates
  doc["longitude"] = 76.52;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send HTTP POST
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("✅ Data sent successfully. Response code: ");
    Serial.println(httpResponseCode);
  } else {
    Serial.print("❌ Error sending data. Code: ");
    Serial.println(httpResponseCode);
  }
  
  http.end();
}
