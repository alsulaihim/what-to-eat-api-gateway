# Firebase Authentication Setup Instructions

## 🔥 Firebase Project Created Successfully!

**Project ID**: `what-to-eat-food-app`  
**Console URL**: https://console.firebase.google.com/project/what-to-eat-food-app/overview

## Required Authentication Setup (Manual Steps)

### Step 1: Enable Authentication Providers

Go to [Firebase Console > Authentication](https://console.firebase.google.com/project/what-to-eat-food-app/authentication/providers)

#### Enable Google Sign-In
1. Click on "Google" provider
2. Toggle "Enable"
3. Add your support email
4. Click "Save"
5. **Note down the Web client ID** for frontend configuration

#### Enable Apple Sign-In
1. Click on "Apple" provider
2. Toggle "Enable" 
3. You'll need Apple Developer account credentials:
   - Apple Team ID
   - Key ID
   - Private Key (.p8 file)
4. Click "Save"

#### Enable Email/Password Authentication
1. Click on "Email/Password" provider
2. Toggle "Enable"
3. Optionally enable "Email link (passwordless sign-in)"
4. Click "Save"

### Step 2: Configure Authorized Domains

1. Go to Authentication > Settings > Authorized domains
2. Add these domains:
   - `localhost` (for development)
   - Your production domain (when deployed)

### Step 3: Generate Service Account Key

1. Go to [Project Settings > Service Accounts](https://console.firebase.google.com/project/what-to-eat-food-app/settings/serviceaccounts/adminsdk)
2. Click "Generate new private key"
3. Download the JSON file
4. **IMPORTANT**: Keep this file secure, never commit it to git

### Step 4: Update Environment Variables

Update your `.env` file with the new project details:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID="what-to-eat-food-app"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[PASTE_PRIVATE_KEY_HERE]\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@what-to-eat-food-app.iam.gserviceaccount.com"
```

### Step 5: Frontend Configuration

For your Next.js frontend, you'll need these Firebase SDK config values:

```javascript
// Get these from Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: "your-web-api-key",
  authDomain: "what-to-eat-food-app.firebaseapp.com",
  projectId: "what-to-eat-food-app", 
  storageBucket: "what-to-eat-food-app.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## Next Steps

1. ✅ **Firebase project created**: `what-to-eat-food-app`
2. 🔄 **Configure authentication providers** (manual step above)
3. 🔄 **Download service account key** (manual step above)  
4. 🔄 **Update API Gateway .env file**
5. 🔄 **Test authentication flow**

## Testing Authentication

Once configured, test the setup:

```bash
# Update .env with Firebase credentials first
docker-compose up -d
npm run test:health
```

The health check should show Firebase configuration as enabled.

## Security Notes

- Never commit service account keys to version control
- Use environment variables for all credentials
- Set up proper CORS origins in production
- Monitor authentication usage and set up alerts

**Firebase Console**: https://console.firebase.google.com/project/what-to-eat-food-app