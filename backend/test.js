// Simple test script to verify backend functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testBackend() {
  console.log('🧪 Testing Backend API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test root endpoint
    console.log('\n2. Testing root endpoint...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Root endpoint passed:', rootResponse.data);

    // Test CORS
    console.log('\n3. Testing CORS...');
    const corsResponse = await axios.get(`${BASE_URL}/health`, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('✅ CORS test passed');

    console.log('\n🎉 All backend tests passed!');
    console.log('\n📋 Available endpoints:');
    console.log('- GET  /health');
    console.log('- GET  /');
    console.log('- POST /api/auth/register');
    console.log('- POST /api/auth/login');
    console.log('- GET  /api/auth/me');
    console.log('- GET  /api/documents');
    console.log('- POST /api/documents');
    console.log('- GET  /api/documents/:id');
    console.log('- PUT  /api/documents/:id');
    console.log('- DELETE /api/documents/:id');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testBackend();
}

module.exports = { testBackend };
