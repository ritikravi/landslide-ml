/*
 * ESP32 Landslide Monitoring - Soil Moisture Only
 * Sends ONLY real sensor data (no fake values)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===== WiFi Configuration =====
const char* ssid = "YOUR_WIFI_SSID";           // Change this to your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";    // Change this to your WiFi password

// ===== Backend API =====
const char* serverUrl = "https://landslide-api.onrender.com/api/sensor-data";

// ===== PINS =====
#define SOIL_PIN 34  // Soil moisture sensor on GPIO34

// ===== Timing =====
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 30000; // Send every 30 seconds

void setup() {
  Serial.begin(115200);
  Serial.println("\n🌱 Soil Moisture Monitor Starting...");
  
  // Connect to WiFi
  connectWiFi();
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
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.println("📡 Ready to send data!\n");
  } else {
    Serial.println("\n❌ WiFi Connection Failed");
    Serial.println("Please check your SSID and password");
  }
}

void loop() {
  // Read soil moisture sensor
  int soilRaw = analogRead(SOIL_PIN);
  
  // Convert to percentage (0-100%)
  // Lower reading = more moisture (sensor gets conductive when wet)
  // Adjust these values based on your sensor calibration:
  // - In dry air: ~2800-4095
  // - In water: ~1000-1500
  float soilMoisture = map(soilRaw, 2800, 1200, 0, 100);
  
  // Constrain to 0-100 range
  if (soilMoisture < 0) soilMoisture = 0;
  if (soilMoisture > 100) soilMoisture = 100;
  
  // Print to Serial Monitor
  Serial.println("------ SENSOR DATA ------");
  Serial.print("Raw Value: ");
  Serial.println(soilRaw);
  Serial.print("Soil Moisture: ");
  Serial.print(soilMoisture, 1);
  Serial.println("%");
  
  // Determine status
  String status = "DRY";
  if (soilMoisture > 70) status = "WET 💧";
  else if (soilMoisture > 40) status = "MOIST";
  else if (soilMoisture > 20) status = "DRY";
  else status = "VERY DRY ⚠️";
  
  Serial.print("Status: ");
  Serial.println(status);
  Serial.println("-------------------------\n");
  
  // Send to cloud every 30 seconds
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= sendInterval) {
    if (WiFi.status() == WL_CONNECTED) {
      sendDataToCloud(soilMoisture);
      lastSendTime = currentTime;
    } else {
      Serial.println("❌ WiFi disconnected. Reconnecting...");
      connectWiFi();
    }
  }
  
  delay(2000); // Read every 2 seconds, but send every 30 seconds
}

void sendDataToCloud(float soilMoisture) {
  Serial.println("📡 Sending data to cloud...");
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(15000); // 15 second timeout
  
  // Create JSON with ONLY soil moisture
  // Other fields are optional in the backend
  StaticJsonDocument<256> doc;
  doc["soilMoisture"] = soilMoisture;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.print("Payload: ");
  Serial.println(jsonString);
  
  // Send HTTP POST
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.print("✅ Success! Response code: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode == 201) {
      Serial.println("✅ Data saved to database!");
      
      // Print server response
      String response = http.getString();
      Serial.println("Server response:");
      Serial.println(response);
    }
  } else {
    Serial.print("❌ Error sending data. Code: ");
    Serial.println(httpResponseCode);
    
    if (httpResponseCode == -1) {
      Serial.println("Connection failed. Check:");
      Serial.println("- Backend URL is correct");
      Serial.println("- WiFi connection is stable");
      Serial.println("- Backend server is running");
    }
  }
  
  http.end();
  Serial.println("-----------------------------\n");
}
