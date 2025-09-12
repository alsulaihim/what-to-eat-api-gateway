# Port Configuration - What to Eat App

## 🚀 Current Setup

### API Gateway (Backend)
- **Port**: 3031
- **URL**: http://localhost:3031
- **Health Check**: http://localhost:3031/health
- **API Documentation**: http://localhost:3031/api-docs

### Frontend Application
- **Port**: 3030 (recommended)
- **URL**: http://localhost:3030

## 🔧 Configuration Details

### CORS Settings
The API Gateway is configured to allow requests from:
- `http://localhost:3030` (Frontend)
- `http://localhost:3031` (API Gateway self)

### Environment Variables
```bash
PORT=3031
CORS_ORIGIN="http://localhost:3030,http://localhost:3031"
```

### Firebase Authentication
- ✅ Successfully initialized
- Project: `what-to-eat-food-app`

### Database Connection  
- ✅ PostgreSQL connected via Prisma
- Database health check available at `/health`

## 📝 Frontend Configuration

When setting up your frontend application, configure the API base URL as:

```javascript
// For React/Next.js
const API_BASE_URL = 'http://localhost:3031';

// For environment variables
REACT_APP_API_URL=http://localhost:3031
# or
NEXT_PUBLIC_API_URL=http://localhost:3031
```

## 🔐 Authentication

The API Gateway includes Firebase Authentication integration:
- Token validation endpoint: `POST /api/auth/validate-token`
- Logout endpoint: `DELETE /api/auth/logout`

## ⚡ Development

Start the API Gateway:
```bash
npm run start:dev
```

The server will run on port 3031 with hot reloading enabled.