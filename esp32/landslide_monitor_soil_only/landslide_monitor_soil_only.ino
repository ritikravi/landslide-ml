/*
 * ESP32 Landslide Monitoring - MPU6050 Diagnostic
 * Tests multiple GPIO pins to find MPU6050
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>

const char* ssid = "Ritik";
const char* password = "rrrrrrrr";
const char* serverUrl = "https://landslide-api.onrender.com/api/sensor-data";

#define SOIL_PIN 34
#define VIBRATION_PIN 27  // Vibration sensor DO pin
const int MPU_ADDR = 0x68;

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 30000;
bool firstRun = true;
int vibrationCount = 0;  // Count vibrations in 30-second window

int SDA_PIN = 21;
int SCL_PIN = 22;
bool mpu6050Found = false;

bool scanI2C() {
  byte error, address;
  int nDevices = 0;
  
  for(address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
    
    if (error == 0) {
      Serial.print("  ✅ Device at 0x");
      if (address < 16) Serial.print("0");
      Serial.print(address, HEX);
      if (address == 0x68 || address == 0x69) {
        Serial.print(" <- MPU6050!");
        mpu6050Found = true;
      }
      Serial.println();
      nDevices++;
    }
  }
  
  return (nDevices > 0);
}

void testPinConfiguration(int sda, int scl) {
  Serial.print("Testing SDA=GPIO");
  Serial.print(sda);
  Serial.print(", SCL=GPIO");
  Serial.println(scl);
  
  Wire.end();
  delay(100);
  Wire.begin(sda, scl);
  delay(100);
  
  if (scanI2C()) {
    Serial.println("✅ FOUND MPU6050!");
    SDA_PIN = sda;
    SCL_PIN = scl;
  } else {
    Serial.println("❌ Nothing found\n");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  // Setup vibration sensor pin
  pinMode(VIBRATION_PIN, INPUT);
  
  Serial.println("\n\n========================================");
  Serial.println("🔧 MPU6050 DIAGNOSTIC MODE");
  Serial.println("========================================\n");
  
  // Test many pin combinations
  Serial.println("Testing all possible I2C pin combinations...\n");
  
  // Standard pins
  testPinConfiguration(21, 22);
  if (mpu6050Found) goto found;
  
  testPinConfiguration(22, 21);
  if (mpu6050Found) goto found;
  
  // Alternative common pins
  testPinConfiguration(18, 19);
  if (mpu6050Found) goto found;
  
  testPinConfiguration(19, 18);
  if (mpu6050Found) goto found;
  
  testPinConfiguration(16, 17);
  if (mpu6050Found) goto found;
  
  testPinConfiguration(17, 16);
  if (mpu6050Found) goto found;
  
  testPinConfiguration(4, 5);
  if (mpu6050Found) goto found;
  
  testPinConfiguration(5, 4);
  if (mpu6050Found) goto found;
  
  testPinConfiguration(13, 14);
  if (mpu6050Found) goto found;
  
  testPinConfiguration(14, 13);
  if (mpu6050Found) goto found;
  
  testPinConfiguration(25, 26);
  if (mpu6050Found) goto found;
  
  testPinConfiguration(26, 25);
  if (mpu6050Found) goto found;
  
  testPinConfiguration(32, 33);
  if (mpu6050Found) goto found;
  
  testPinConfiguration(33, 32);
  if (mpu6050Found) goto found;
  
  Serial.println("========================================");
  Serial.println("❌ MPU6050 NOT FOUND ON ANY PINS!");
  Serial.println("========================================");
  Serial.println("\nPossible causes:");
  Serial.println("1. MPU6050 sensor is damaged/faulty");
  Serial.println("2. SCL wire is broken internally");
  Serial.println("3. SDA wire is broken internally");
  Serial.println("4. MPU6050 AD0 pin affects address (try 0x69)");
  Serial.println("5. Breadboard connections are loose");
  Serial.println("\nContinuing with soil sensor only...\n");
  
  Wire.begin(21, 22); // Default for other operations
  goto skip;
  
found:
  Serial.println("\n========================================");
  Serial.println("✅ SUCCESS!");
  Serial.print("✅ MPU6050 found on SDA=GPIO");
  Serial.print(SDA_PIN);
  Serial.print(", SCL=GPIO");
  Serial.println(SCL_PIN);
  Serial.println("========================================\n");
  
  // Initialize MPU6050
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);
  Wire.write(0);
  Wire.endTransmission(true);
  delay(100);
  
skip:
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
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
    Serial.println("");
  }
}

void readMPU6050(float &tiltX, float &tiltY) {
  if (!mpu6050Found) {
    tiltX = 0;
    tiltY = 0;
    return;
  }
  
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  byte error = Wire.endTransmission(false);
  
  if (error != 0) {
    tiltX = 0;
    tiltY = 0;
    return;
  }
  
  Wire.requestFrom(MPU_ADDR, 6, true);
  
  if (Wire.available() < 6) {
    tiltX = 0;
    tiltY = 0;
    return;
  }
  
  int16_t accX = Wire.read() << 8 | Wire.read();
  int16_t accY = Wire.read() << 8 | Wire.read();
  int16_t accZ = Wire.read() << 8 | Wire.read();
  
  Serial.print("Raw: X=");
  Serial.print(accX);
  Serial.print(" Y=");
  Serial.print(accY);
  Serial.print(" Z=");
  Serial.println(accZ);
  
  tiltX = atan2(accY, accZ) * 180.0 / PI;
  tiltY = atan2(-accX, sqrt(accY * accY + accZ * accZ)) * 180.0 / PI;
}

void loop() {
  int soilRaw = analogRead(SOIL_PIN);
  float soilMoisture = map(soilRaw, 2800, 1200, 0, 100);
  if (soilMoisture < 0) soilMoisture = 0;
  if (soilMoisture > 100) soilMoisture = 100;
  
  // Read vibration sensor
  int vibrationState = digitalRead(VIBRATION_PIN);
  bool vibrationDetected = (vibrationState == HIGH);
  
  // Count vibrations in the 30-second window
  if (vibrationDetected) {
    vibrationCount++;
  }
  
  float tiltX, tiltY;
  readMPU6050(tiltX, tiltY);
  float tiltAngle = sqrt(tiltX * tiltX + tiltY * tiltY);
  
  Serial.println("------ SENSOR DATA ------");
  Serial.print("Soil: ");
  Serial.print(soilMoisture, 1);
  Serial.println("%");
  
  Serial.print("Vibration: ");
  if (vibrationDetected) {
    Serial.println("⚠️  DETECTED!");
  } else {
    Serial.println("None");
  }
  Serial.print("Vibration Count (30s): ");
  Serial.println(vibrationCount);
  
  if (mpu6050Found) {
    Serial.print("Tilt X: ");
    Serial.print(tiltX, 2);
    Serial.println("°");
    Serial.print("Tilt Y: ");
    Serial.print(tiltY, 2);
    Serial.println("°");
    Serial.print("Angle: ");
    Serial.print(tiltAngle, 2);
    Serial.println("°");
  } else {
    Serial.println("Tilt: N/A (sensor not found)");
  }
  
  Serial.println("-------------------------\n");
  
  unsigned long currentTime = millis();
  if (firstRun || (currentTime - lastSendTime >= sendInterval)) {
    if (WiFi.status() == WL_CONNECTED) {
      // Send the vibration count from the 30-second window
      sendDataToCloud(soilMoisture, tiltAngle, vibrationCount);
      
      // Reset count after sending
      vibrationCount = 0;
      
      lastSendTime = currentTime;
      firstRun = false;
    }
  }
  
  delay(2000);
}

void sendDataToCloud(float soilMoisture, float tilt, int vibration) {
  Serial.println("📡 Sending to cloud...");
  
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(20000);
  
  StaticJsonDocument<256> doc;
  doc["soilMoisture"] = soilMoisture;
  doc["tilt"] = tilt;
  doc["vibration"] = vibration;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
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
