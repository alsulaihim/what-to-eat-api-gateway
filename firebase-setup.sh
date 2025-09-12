#!/bin/bash

# Firebase Project Setup Script for What to Eat API Gateway
# Run this script after logging into Firebase CLI

set -e

echo "🔥 Setting up Firebase project: what-to-eat-1"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️ Please login to Firebase first:${NC}"
    echo "firebase login"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI ready${NC}"

# Create the Firebase project
echo -e "${YELLOW}📦 Creating Firebase project...${NC}"
if firebase projects:create what-to-eat-1 --display-name "What to Eat" 2>/dev/null; then
    echo -e "${GREEN}✅ Project 'what-to-eat-1' created successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Project might already exist or you don't have permission${NC}"
fi

# Set the project as default
echo -e "${YELLOW}🎯 Setting project as default...${NC}"
firebase use what-to-eat-1

# Enable Authentication
echo -e "${YELLOW}🔐 Enabling Authentication...${NC}"
firebase deploy --only auth || echo -e "${YELLOW}⚠️ Auth deployment might need manual configuration${NC}"

# Create service account for API Gateway
echo -e "${YELLOW}🔑 Service Account Setup Instructions:${NC}"
echo ""
echo "1. Go to Firebase Console: https://console.firebase.google.com/project/what-to-eat-1"
echo "2. Go to Project Settings > Service Accounts"
echo "3. Click 'Generate New Private Key'"
echo "4. Download the JSON file"
echo "5. Extract the following values for your .env file:"
echo ""
echo "   FIREBASE_PROJECT_ID=\"what-to-eat-1\""
echo "   FIREBASE_PRIVATE_KEY=\"-----BEGIN PRIVATE KEY-----\\n[YOUR_PRIVATE_KEY]\\n-----END PRIVATE KEY-----\\n\""
echo "   FIREBASE_CLIENT_EMAIL=\"[SERVICE_ACCOUNT_EMAIL]\""
echo ""

# Authentication providers setup
echo -e "${YELLOW}🔧 Authentication Providers Setup:${NC}"
echo ""
echo "1. Go to Firebase Console > Authentication > Sign-in method"
echo "2. Enable the following providers:"
echo "   - Google (OAuth 2.0)"
echo "   - Apple (OAuth 2.0)" 
echo "   - Email/Password"
echo ""
echo "3. For Google Sign-In:"
echo "   - Add your domain to authorized domains"
echo "   - Configure OAuth consent screen"
echo ""
echo "4. For Apple Sign-In:"
echo "   - Configure Apple Developer account integration"
echo "   - Add your bundle IDs"
echo ""

# Firebase Security Rules
echo -e "${YELLOW}🛡️ Setting up Firestore security rules...${NC}"
cat > firestore.rules << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public read access to algorithm weights for admin
    match /algorithm_weights/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
EOF

echo -e "${GREEN}✅ Firestore rules created${NC}"

# Create firestore indexes
cat > firestore.indexes.json << 'EOF'
{
  "indexes": [
    {
      "collectionGroup": "api_usage_tracking",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "apiName",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF

echo -e "${GREEN}✅ Firestore indexes configuration created${NC}"

# Deploy Firestore rules and indexes
echo -e "${YELLOW}📋 Deploying Firestore configuration...${NC}"
firebase deploy --only firestore || echo -e "${YELLOW}⚠️ Manual Firestore setup may be required${NC}"

echo ""
echo -e "${GREEN}🎉 Firebase setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure authentication providers in Firebase Console"
echo "2. Download service account key and update .env file"
echo "3. Test the API Gateway with Firebase authentication"
echo ""
echo -e "${YELLOW}Firebase Console:${NC} https://console.firebase.google.com/project/what-to-eat-1"
echo -e "${YELLOW}Project ID:${NC} what-to-eat-1"
echo ""
echo -e "${GREEN}Setup script completed successfully!${NC}"