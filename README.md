# What to Eat - API Gateway

A sophisticated NestJS-based API Gateway for the "What to Eat" food recommendation system. This service provides AI-powered food recommendations using social intelligence, user preferences, and real-time contextual data.

## 🏗️ Architecture

This API Gateway follows a distributed microservices architecture with:

- **Authentication**: Firebase Auth integration with JWT tokens
- **Database**: PostgreSQL with Prisma ORM
- **External APIs**: Google Places, Google Maps, Google Trends, OpenAI ChatGPT
- **Caching**: Redis for high-performance data caching
- **Documentation**: OpenAPI/Swagger auto-generated docs
- **Security**: Helmet, CORS, rate limiting, input validation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- Firebase project ("what-to-eat-1")
- Google Cloud Console project with APIs enabled:
  - Google Places API
  - Google Maps JavaScript API
  - Google Maps Geocoding API
- OpenAI API account

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Update `.env` with your actual API keys and credentials:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID="what-to-eat-1"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@what-to-eat-1.iam.gserviceaccount.com"

# Google APIs
GOOGLE_PLACES_API_KEY="your_google_places_api_key_here"
GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"

# OpenAI
OPENAI_API_KEY="your_openai_api_key_here"

# Security
JWT_SECRET="your_very_long_and_random_jwt_secret_here"
```

### 2. Development with Docker (Recommended)

Start all services with Docker Compose:
```bash
docker-compose up -d
```

This starts:
- **API Gateway**: `http://localhost:3001`
- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`
- **pgAdmin**: `http://localhost:8080` (admin@foodapp.com / admin123)
- **RedisInsight**: `http://localhost:8001`

### 3. Database Migration

Run Prisma migrations:
```bash
# If running in Docker
docker-compose exec api-gateway npx prisma migrate dev

# If running locally
npx prisma migrate dev
```

### 4. Local Development (Alternative)

If you prefer local development:
```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis (via Docker)
docker-compose up postgres redis -d

# Run database migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

## 📚 API Documentation

Once running, visit the interactive API documentation:
- **Swagger UI**: `http://localhost:3001/api-docs`

### Core Endpoints

#### Authentication
- `POST /api/auth/validate-token` - Validate Firebase ID token
- `DELETE /api/auth/logout` - Logout user

#### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile  
- `PUT /api/users/preferences` - Update food preferences
- `DELETE /api/users/account` - Delete user account

#### Health Checks
- `GET /` - Basic health check
- `GET /health` - Detailed health status

### Authentication

All protected endpoints require a Firebase ID token in the Authorization header:
```bash
Authorization: Bearer <firebase-id-token>
```

## 🔧 Development

### Project Structure

```
src/
├── auth/                 # Firebase authentication
├── users/               # User profile management  
├── external-apis/       # Google & OpenAI integrations
│   ├── google/         # Places, Maps, Trends services
│   └── openai/         # ChatGPT integration
├── recommendations/     # Food recommendation engine
└── common/             # Shared modules
    ├── database/       # Prisma database service
    ├── firebase/       # Firebase admin service
    ├── guards/         # Auth guards
    ├── interceptors/   # Logging, caching
    ├── dto/           # Data transfer objects
    └── filters/       # Exception filters
```

### Code Quality

This project enforces strict TypeScript and code quality standards:

- **TypeScript**: Strict mode enabled, no `any` types allowed
- **ESLint**: Must pass all linting rules
- **Prettier**: Code formatting enforced
- **Tests**: Minimum 80% coverage required

### Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging

# Building
npm run build              # Build for production
npm run start:prod         # Start production build

# Testing
npm run test              # Unit tests
npm run test:watch        # Watch mode
npm run test:cov          # With coverage
npm run test:e2e          # End-to-end tests

# Database
npx prisma studio         # Database GUI
npx prisma migrate dev    # Run migrations
npx prisma generate       # Generate client
```

## 🔒 Security Features

### Authentication & Authorization
- Firebase JWT token validation
- User session management
- Role-based access control (planned)

### API Security
- Helmet.js security headers
- CORS with configurable origins
- Rate limiting (100 req/min default)
- Request validation and sanitization
- Input/output DTOs with class-validator

### Data Protection
- Environment variable protection
- Database query parameterization
- API key rotation support
- Comprehensive audit logging

## 🌍 Environment Configuration

### Development
- Hot reloading enabled
- Detailed logging
- Database seeding available
- Mock external APIs for testing

### Production
- Optimized Docker image
- Health checks configured
- Monitoring and alerting ready
- Horizontal scaling support

## 📊 Monitoring & Observability

### Health Checks
- `/health` endpoint with database connectivity
- Docker health checks configured
- External API status monitoring

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking and alerting
- Performance metrics

### API Usage Tracking
- Cost monitoring for external APIs
- Usage analytics per endpoint
- Rate limiting metrics

## 🚢 Deployment

### Docker Production Build
```bash
# Build production image
docker build --target production -t food-api-gateway:latest .

# Run production container
docker run -p 3001:3001 --env-file .env food-api-gateway:latest
```

### CI/CD Pipeline
The project is ready for CI/CD integration with:
- Automated testing on pull requests
- Docker image building and publishing
- Database migration automation
- Environment-specific deployments

## 🔧 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify PostgreSQL is running: `docker-compose ps postgres`
- Check environment variables: `DATABASE_URL`
- Run migrations: `npx prisma migrate dev`

**Firebase Authentication Errors**
- Verify Firebase project ID and credentials
- Check if Firebase Admin SDK is properly configured
- Ensure service account has proper permissions

**External API Errors**
- Verify all API keys are set correctly
- Check API quotas and billing
- Review rate limiting configurations

### Debugging
```bash
# View API Gateway logs
docker-compose logs -f api-gateway

# Access container shell
docker-compose exec api-gateway sh

# Database console
docker-compose exec postgres psql -U postgres -d what_to_eat_db
```

## 🤝 Contributing

1. Follow TypeScript strict mode requirements
2. Maintain test coverage above 80%
3. Use conventional commit messages
4. Update API documentation for new endpoints
5. Follow security best practices

## 📝 License

This project is private and proprietary.

---

## 🔗 Related Services

This API Gateway is part of the "What to Eat" ecosystem:
- **Web Frontend**: Next.js 14 application
- **Mobile App**: Swift iOS application (planned)
- **Admin Dashboard**: Management interface (planned)

For questions or support, please refer to the project documentation or contact the development team.
