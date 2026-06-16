/*
 * ESP32 Landslide Monitoring - MPU6050 Diagnostic
 * Tests multiple GPIO pins to find MPU6050
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
const int MPU_ADDR = 0x68;

unsigned long lastSendTime = 0;
const unsigned long sendInterval = 30000;
bool firstRun = true;
int vibrationCount = 0;  // Count vibrations in 30-second window

int SDA_PIN = 21;
int SCL_PIN = 22;
bool mpu6050Found = false;

TinyGPSPlus gps;
HardwareSerial gpsSerial(2);  // Use UART2

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
  
  // Setup ultrasonic sensor pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.println("📏 Ultrasonic sensor initialized on GPIO25/26");
  
  // Setup GPS - Try standard configuration first
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
  Serial.println("🛰️  GPS module initialized on GPIO16(RX)/GPIO17(TX)");
  Serial.println("⏳ Testing GPS for 5 seconds...");
  
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
  // Test GPS for 5 seconds to see if we're getting data
  unsigned long gpsTestStart = millis();
  int charsReceived = 0;
  
  while (millis() - gpsTestStart < 5000) {
    if (gpsSerial.available() > 0) {
      char c = gpsSerial.read();
      charsReceived++;
      gps.encode(c);
    }
  }
  
  Serial.println("\n========================================");
  Serial.println("🛰️  GPS CONNECTION TEST");
  Serial.println("========================================");
  Serial.print("Characters received: ");
  Serial.println(charsReceived);
  
  if (charsReceived == 0) {
    Serial.println("\n❌ NO DATA from GPS!");
    Serial.println("\n⚠️  TX/RX might be SWAPPED!");
    Serial.println("Try swapping the wires:");
    Serial.println("  GPS TX → ESP32 GPIO17 (instead of GPIO16)");
    Serial.println("  GPS RX → ESP32 GPIO16 (instead of GPIO17)");
    Serial.println("\nOR check:");
    Serial.println("  1. GPS VCC connected to 5V");
    Serial.println("  2. GPS GND connected to GND");
    Serial.println("  3. Wires are not broken");
    Serial.println("  4. GPS module LED is blinking");
  } else {
    Serial.println("\n✅ GPS is sending data!");
    Serial.print("Sentences processed: ");
    Serial.println(gps.sentencesWithFix());
    Serial.println("\nGPS hardware OK. Move outside for satellite lock.");
  }
  Serial.println("========================================\n");
  
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
  
  float tiltX, tiltY;
  readMPU6050(tiltX, tiltY);
  float tiltAngle = sqrt(tiltX * tiltX + tiltY * tiltY);
  
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
  }
  
  // Only send GPS if we have a valid fix
  if (latitude != 0.0 && longitude != 0.0) {
    doc["latitude"] = latitude;
    doc["longitude"] = longitude;
  }
  
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
