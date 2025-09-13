#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3031';

// Mock Firebase token for testing (you'll need a real one for actual testing)
const mockFirebaseToken = 'your-firebase-token-here';

async function testRecommendationAPI() {
  console.log('🧪 Testing Recommendation API...\n');

  try {
    // Test 1: Basic recommendation request
    console.log('📍 Test 1: Basic recommendation request');
    const recommendationRequest = {
      location: 'New York, NY',
      latitude: 40.7128,
      longitude: -74.0060,
      maxDistance: 5,
      includeTrending: true
    };

    const response = await axios.post(
      `${API_BASE_URL}/api/recommendations`,
      recommendationRequest,
      {
        headers: {
          'Authorization': `Bearer ${mockFirebaseToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('✅ Status:', response.status);
    console.log('📊 Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.log('❌ Error Response:', error.response.status, error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
  }

  try {
    // Test 2: Get trending restaurants
    console.log('\n📈 Test 2: Get trending restaurants');
    const trendingResponse = await axios.get(
      `${API_BASE_URL}/api/recommendations/trending?location=New York&radius=10`,
      {
        headers: {
          'Authorization': `Bearer ${mockFirebaseToken}`
        },
        timeout: 15000
      }
    );

    console.log('✅ Trending Status:', trendingResponse.status);
    console.log('📊 Trending Response:', JSON.stringify(trendingResponse.data, null, 2));

  } catch (error) {
    if (error.response) {
      console.log('❌ Trending Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Trending Error:', error.message);
    }
  }

  try {
    // Test 3: API Documentation
    console.log('\n📚 Test 3: API Documentation');
    const docsResponse = await axios.get(`${API_BASE_URL}/api-docs`, {
      timeout: 10000
    });

    console.log('✅ Docs Status:', docsResponse.status);
    console.log('📄 API Documentation is available');

  } catch (error) {
    console.log('❌ Docs Error:', error.message);
  }

  try {
    // Test 4: Health Check
    console.log('\n🏥 Test 4: Health Check');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`, {
      timeout: 10000
    });

    console.log('✅ Health Status:', healthResponse.status);
    console.log('💊 Health Response:', JSON.stringify(healthResponse.data, null, 2));

  } catch (error) {
    console.log('❌ Health Error:', error.message);
  }

  console.log('\n🎉 API Testing Complete!');
  console.log('\nNext steps:');
  console.log('1. Get a real Firebase authentication token');
  console.log('2. Test with real user data');
  console.log('3. Verify ChatGPT responses');
  console.log('4. Check Google API integration');
}

// Run the test
testRecommendationAPI();