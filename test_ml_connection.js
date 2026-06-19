// Test ML API connectivity from backend's perspective
const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'https://landslide-ml-api.onrender.com';

async function testMLAPI() {
  console.log('🧪 Testing ML API Connection\n');
  console.log(`Target: ${ML_API_URL}\n`);
  
  // Test 1: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const health = await axios.get(`${ML_API_URL}/health`, { timeout: 10000 });
    console.log('✅ Health check passed');
    console.log('   Response:', health.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
  
  console.log('\n2️⃣ Testing prediction endpoint...');
  try {
    const prediction = await axios.post(`${ML_API_URL}/predict`, {
      soilMoisture: 10,
      waterLevel: 11,
      tilt: 0,
      vibration: 0,
      ultrasonicDistance: 82
    }, { 
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Prediction successful');
    console.log('   Risk Level:', prediction.data.prediction.riskLevel);
    console.log('   Risk Score:', prediction.data.prediction.riskScore);
    console.log('   Confidence:', prediction.data.prediction.confidence + '%');
    console.log('   Full response:', JSON.stringify(prediction.data, null, 2));
  } catch (error) {
    console.error('❌ Prediction failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testMLAPI();
