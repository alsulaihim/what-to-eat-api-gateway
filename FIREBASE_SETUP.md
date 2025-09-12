# Firebase Project Setup Guide

## 🔥 Complete Firebase Setup for "What to Eat" API Gateway

This guide will help you create and configure the Firebase project required for the API Gateway.

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Google account with Firebase access
- Billing enabled (required for some features)

## Step 1: Login to Firebase

```bash
firebase login
```

This opens your browser for Google authentication.

## Step 2: Automated Setup (Recommended)

Run the provided setup script:

```bash
./firebase-setup.sh
```

Or follow the manual steps below:

## Step 3: Manual Setup

### Create Firebase Project

```bash
firebase projects:create what-to-eat-1 --display-name "What to Eat"
```

### Set as Default Project

```bash
firebase use what-to-eat-1
```

## Step 4: Enable Authentication Providers

1. Go to [Firebase Console](https://console.firebase.google.com/project/what-to-eat-1)
2. Navigate to **Authentication > Sign-in method**
3. Enable these providers:

### Google Sign-In
- Click on Google provider
- Enable it
- Add your web domain to authorized domains
- Note down the Web client ID for frontend use

### Apple Sign-In
- Click on Apple provider  
- Enable it
- Configure with your Apple Developer account
- Add your iOS bundle ID

### Email/Password
- Click on Email/Password provider
- Enable it
- Optionally enable email verification

## Step 5: Create Service Account

1. Go to **Project Settings > Service Accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. Extract these values for your `.env` file:

```bash
FIREBASE_PROJECT_ID="what-to-eat-1"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[FULL_PRIVATE_KEY_HERE]\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@what-to-eat-1.iam.gserviceaccount.com"
```

**Important**: Replace `\n` in the private key with actual newlines, or keep as `\n` and the code will handle it.

## Step 6: Configure Firestore (Optional)

If you plan to use Firestore in addition to PostgreSQL:

1. Go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** or **"Start in production mode"**
4. Select a location close to your users

## Step 7: Set up Security Rules

The setup script creates these files:

### `firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /algorithm_weights/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

Deploy with:
```bash
firebase deploy --only firestore:rules
```

## Step 8: Update API Gateway Configuration

Update your `.env` file in the API Gateway:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID="what-to-eat-1"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[YOUR_ACTUAL_PRIVATE_KEY]\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@what-to-eat-1.iam.gserviceaccount.com"
```

## Step 9: Test the Configuration

1. Start your API Gateway:
```bash
docker-compose up -d
```

2. Test the health check:
```bash
npm run test:health
```

3. Check Firebase connection in the detailed health endpoint:
```bash
curl http://localhost:3001/health
```

## Step 10: Frontend Configuration

For your Next.js frontend, you'll need these Firebase config values:

```javascript
// firebase-config.js
const firebaseConfig = {
  apiKey: "your-web-api-key",
  authDomain: "what-to-eat-1.firebaseapp.com",
  projectId: "what-to-eat-1",
  storageBucket: "what-to-eat-1.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

Get these values from **Project Settings > General > Your apps > Web app**

## Verification Checklist

- [ ] Firebase project "what-to-eat-1" created
- [ ] Authentication providers enabled (Google, Apple, Email)
- [ ] Service account created and credentials downloaded
- [ ] `.env` file updated with Firebase credentials
- [ ] API Gateway starts without Firebase errors
- [ ] Health check shows Firebase configuration as `true`

## Troubleshooting

### Common Issues

**"Permission denied" creating project**
- Check if you have Firebase admin access
- Ensure billing is enabled on your Google account

**"Invalid credentials" in API Gateway**
- Verify the private key format (with `\n` newlines)
- Check that the service account email is correct
- Ensure the project ID matches exactly

**Authentication not working**
- Verify authorized domains in Firebase console
- Check that providers are properly enabled
- Ensure client IDs match between Firebase and frontend

### Getting Help

1. Check Firebase Console for error messages
2. Review API Gateway logs: `docker-compose logs -f api-gateway`
3. Verify environment variables are loaded correctly

## Security Best Practices

1. **Never commit service account keys to version control**
2. **Use environment variables for all credentials**
3. **Enable only necessary authentication providers**
4. **Set up proper Firestore security rules**
5. **Regularly rotate service account keys**
6. **Monitor authentication usage and set up alerts**

## Next Steps

Once Firebase is configured:

1. Set up Google APIs (Places, Maps) 
2. Configure OpenAI API key
3. Test authentication flow end-to-end
4. Deploy to production environment

---

**Firebase Console**: https://console.firebase.google.com/project/what-to-eat-1  
**Project ID**: `what-to-eat-1`  
**Documentation**: https://firebase.google.com/docs