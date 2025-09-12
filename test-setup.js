// Simple test script to verify the API Gateway setup
const axios = require('axios');

async function testHealthCheck() {
  try {
    console.log('🚀 Starting API Gateway health check...\n');
    
    const baseURL = 'http://localhost:3001';
    
    // Test basic health endpoint
    console.log('1. Testing basic health endpoint...');
    const basicHealth = await axios.get(`${baseURL}/`);
    console.log('✅ Basic health check passed');
    console.log(`   Response: ${basicHealth.data.message}\n`);
    
    // Test detailed health endpoint
    console.log('2. Testing detailed health endpoint...');
    const detailedHealth = await axios.get(`${baseURL}/health`);
    console.log('✅ Detailed health check passed');
    console.log(`   Status: ${detailedHealth.data.status}`);
    console.log(`   Database: ${detailedHealth.data.checks.database}\n`);
    
    // Test API documentation
    console.log('3. Testing API documentation...');
    const docs = await axios.get(`${baseURL}/api-docs`);
    console.log('✅ API documentation accessible\n');
    
    console.log('🎉 All health checks passed! API Gateway is ready.');
    console.log('📚 Visit http://localhost:3001/api-docs for interactive API documentation');
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure to start the API Gateway first:');
      console.log('   docker-compose up -d');
      console.log('   or');
      console.log('   npm run start:dev');
    }
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testHealthCheck();
}

module.exports = { testHealthCheck };