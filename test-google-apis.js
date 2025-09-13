// Test script to validate Google API keys
require('dotenv').config();
const https = require('https');

console.log('🔑 Google APIs Test\n');

// Test Google Places API
async function testPlacesAPI() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey || apiKey === 'your_google_places_api_key_here') {
    console.log('❌ Google Places API key not configured');
    return;
  }

  console.log('Testing Google Places API...');
  
  try {
    // Use Places API (New) - Text Search endpoint
    const url = `https://places.googleapis.com/v1/places:searchText`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating'
      },
      body: JSON.stringify({
        textQuery: 'restaurants near me',
        maxResultCount: 5
      })
    });
    const data = await response.json();
    
    if (data.places && data.places.length > 0) {
      console.log('✅ Google Places API: Working');
      console.log(`   Found ${data.places.length} restaurants`);
      console.log(`   Sample: ${data.places[0].displayName?.text || 'N/A'}`);
    } else if (data.error) {
      console.log('❌ Google Places API: Error');
      console.log(`   Error: ${data.error.message}`);
      console.log(`   Status: ${data.error.status}`);
    } else {
      console.log('❌ Google Places API: Unknown response format');
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Google Places API: Network Error');
    console.log(`   Error: ${error.message}`);
  }
}

// Test Google Maps API (Geocoding)
async function testMapsAPI() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
    console.log('❌ Google Maps API key not configured');
    return;
  }

  console.log('Testing Google Maps API...');
  
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=New+York+City&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      console.log('✅ Google Maps API: Working');
      console.log(`   Location: ${data.results[0].formatted_address}`);
      const location = data.results[0].geometry.location;
      console.log(`   Coordinates: ${location.lat}, ${location.lng}`);
    } else {
      console.log('❌ Google Maps API: Error');
      console.log(`   Status: ${data.status}`);
      console.log(`   Error: ${data.error_message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Google Maps API: Network Error');
    console.log(`   Error: ${error.message}`);
  }
}

// Test Google Trends (if configured)
async function testTrendsAPI() {
  const apiKey = process.env.GOOGLE_TRENDS_API_KEY;
  
  if (!apiKey || apiKey === 'your_google_trends_api_key_here' || apiKey === '') {
    console.log('ℹ️  Google Trends API not configured (using alternative approach)');
    return;
  }

  console.log('Testing Google Trends API...');
  // Note: Google Trends doesn't have official API, this would be for alternative service
  console.log('ℹ️  Google Trends integration will use alternative social intelligence');
}

// Run all tests
async function runTests() {
  await testPlacesAPI();
  console.log('');
  await testMapsAPI();
  console.log('');
  await testTrendsAPI();
  console.log('');
  console.log('🚀 API testing complete!');
}

// Add fetch polyfill for older Node versions
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

runTests().catch(console.error);