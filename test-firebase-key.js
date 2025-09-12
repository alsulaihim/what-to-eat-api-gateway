// Test script to validate Firebase private key format
require('dotenv').config();

const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

console.log('🔑 Firebase Private Key Test\n');
console.log('Raw private key length:', privateKeyRaw?.length);
console.log('Contains \\n literals:', privateKeyRaw?.includes('\\n'));
console.log('Contains actual newlines:', privateKeyRaw?.includes('\n'));

// Process the key the same way as our service
let privateKey = privateKeyRaw?.replace(/\\n/g, '\n');

// Remove trailing backslashes from each line (common .env formatting issue)
privateKey = privateKey?.replace(/\\\n/g, '\n');

console.log('\nAfter processing:');
console.log('Processed key length:', privateKey?.length);
console.log('Contains actual newlines:', privateKey?.includes('\n'));
console.log('Starts with BEGIN:', privateKey?.startsWith('-----BEGIN PRIVATE KEY-----'));
console.log('Ends with END:', privateKey?.endsWith('-----END PRIVATE KEY-----'));

// Show first and last 50 characters
console.log('\nFirst 50 chars:', privateKey?.substring(0, 50));
console.log('Last 50 chars:', privateKey?.substring(privateKey?.length - 50));

// Test if we can create a Firebase credential
try {
  const admin = require('firebase-admin');
  
  const credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: privateKey,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  });
  
  console.log('\n✅ Firebase credential created successfully!');
  console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
  console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);
  
} catch (error) {
  console.log('\n❌ Firebase credential creation failed:');
  console.log('Error:', error.message);
}