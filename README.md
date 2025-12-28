# TrueMatch - Trust-First Dating Platform

A production-ready dating application that prioritizes truth, intent alignment, and safety using AI-powered features.

## 🎯 Core Features

### 1. AI Onboarding & Truth Amplification
- Behavior-based and scenario questions
- AI follow-ups to clarify vague or conflicting answers (max 10)
- Answer confidence and consistency tracking

### 2. Profile Strength Score (0–100)
Internal scoring based on:
- Completeness
- Specificity
- Consistency
- Stability over time
- Behavior signals

Users see improvement tips; score affects discovery ranking.

### 3. Truth-Weighted Matching Engine
- Hard filters first (age, distance, intent, dealbreakers)
- Compatibility score using:
  - Values: 35%
  - Lifestyle: 25%
  - Intent/Goals: 20%
  - Communication: 15%
  - Logistics: 5%
- Returns match score + top reasons + friction point

### 4. Behavior-Based Trust
Continuously scores actions:
- Reply patterns, flaking, ghosting
- Boundary pushing
- Message tone vs stated intent

### 5. Danger/Risk Protection (Internal Only)
User Risk Index (0–100):
- 0–29: Normal
- 30–59: Monitor
- 60–79: Restricted
- 80–100: Manual Review

### 6. Graduated Protections
- **Soft**: Match limits, delayed messages, re-verification
- **Hard**: Shadow restriction, message screening, lock/removal

### 7. Safety Signals (Positive Only)
Displays: Verified photos, consistent profile history, respected boundaries

### 8. Pre-Date Safety AI
Before first dates:
- Scans chat for pressure/control language
- Suggests public locations, check-ins, location sharing

### 9. Intent Drift Detection
Detects mismatch between stated goals and behavior, lowers intent confidence.

## 🛠 Tech Stack

- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Cache**: Redis
- **Real-time**: WebSockets (Socket.IO)
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
truematch/
├── backend/                 # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.ts          # Seed data
│   └── src/
│       ├── modules/
│       │   ├── auth/        # Authentication
│       │   ├── users/       # User management
│       │   ├── profiles/    # Profile & scoring
│       │   ├── onboarding/  # AI questions
│       │   ├── matching/    # Compatibility engine
│       │   ├── messages/    # Chat & WebSocket
│       │   ├── safety/      # Risk & protection
│       │   ├── trust/       # Behavior scoring
│       │   └── ai/          # AI services
│       ├── prisma/          # Database service
│       └── redis/           # Cache service
├── docker-compose.yml       # Container orchestration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### Local Development

1. **Clone and install dependencies**
```bash
cd backend
npm install
```

2. **Start infrastructure (PostgreSQL & Redis)**
```bash
docker-compose up -d postgres redis
```

3. **Set up the database**
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

4. **Start development server**
```bash
cd backend
npm run dev
```

5. **Access the application**
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

### Using Docker Compose (Full Stack)

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed the database
docker-compose exec backend npm run db:seed
```

## 🚂 Railway Deployment

### Quick Deploy

1. **Fork this repository** to your GitHub account

2. **Create a new project** on [Railway](https://railway.app)

3. **Add PostgreSQL**:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

4. **Add Redis** (optional but recommended):
   - Click "New" → "Database" → "Redis"
   - Railway will automatically set `REDIS_URL`

5. **Deploy the backend**:
   - Click "New" → "GitHub Repo" → Select your forked repo
   - Set the root directory to `backend`
   - Railway will auto-detect and build the NestJS app

6. **Set environment variables** in Railway dashboard:
   ```
   JWT_SECRET=your-secure-random-string-here
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.com
   ```

7. **Generate a domain**:
   - Go to your service settings
   - Click "Generate Domain" or add a custom domain

### Environment Variables for Railway

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Auto-provided by Railway PostgreSQL |
| `REDIS_URL` | No | Auto-provided by Railway Redis |
| `JWT_SECRET` | Yes | Secure random string for JWT signing |
| `JWT_EXPIRES_IN` | No | Token expiration (default: 7d) |
| `NODE_ENV` | No | Set to `production` |
| `FRONTEND_URL` | No | Your frontend URL for CORS |
| `OPENAI_API_KEY` | No | For AI features (uses rule-based fallback if not set) |

### Seeding Production Database

After deployment, you can seed the database using Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run seed command
railway run npm run db:seed
```

### Health Check Endpoints

- `GET /api/health` - Full health check with database status
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

## 📊 Test Accounts

After seeding, you can log in with:
- **Email**: alex@example.com | **Password**: Password123!
- **Email**: sarah@example.com | **Password**: Password123!
- **Email**: emma@example.com | **Password**: Password123!

## 🧪 Running Tests

```bash
cd backend
npm run test

# With coverage
npm run test:cov
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users/me` - Get user details
- `PUT /api/users/me` - Update user
- `POST /api/users/me/change-password` - Change password
- `POST /api/users/me/deactivate` - Deactivate account
- `DELETE /api/users/me` - Delete account

### Profiles
- `POST /api/profiles` - Create profile
- `GET /api/profiles` - Get own profile
- `PUT /api/profiles` - Update profile
- `GET /api/profiles/score` - Get profile strength score
- `POST /api/profiles/photos` - Add photo
- `DELETE /api/profiles/photos/:photoId` - Delete photo
- `POST /api/profiles/prompts` - Add prompt

### Onboarding
- `GET /api/onboarding/questions` - Get onboarding questions
- `GET /api/onboarding/progress` - Get progress
- `POST /api/onboarding/answer` - Submit answer
- `POST /api/onboarding/complete` - Complete onboarding

### Matching
- `GET /api/matching/discover` - Get discovery profiles
- `POST /api/matching/like/:userId` - Like a user
- `POST /api/matching/pass/:userId` - Pass on a user
- `GET /api/matching/matches` - Get all matches
- `GET /api/matching/matches/:id` - Get match details

### Messages
- `GET /api/messages/match/:matchId` - Get messages
- `POST /api/messages/match/:matchId` - Send message
- `POST /api/messages/match/:matchId/read` - Mark as read
- `GET /api/messages/unread` - Get unread count

### Safety
- `POST /api/safety/report` - Report a user
- `GET /api/safety/signals/:userId` - Get safety signals
- `GET /api/safety/pre-date/:matchId` - Pre-date safety check
- `POST /api/safety/dates` - Schedule a date
- `POST /api/safety/block` - Block a user

### Trust
- `GET /api/trust/score` - Get own trust score

## 🔐 Security Features

1. **Password Requirements**: Minimum 8 characters, uppercase, lowercase, number/special char
2. **JWT Authentication**: Secure token-based auth
3. **Content Screening**: AI-powered message safety analysis
4. **Risk Assessment**: Internal user risk scoring
5. **Rate Limiting**: API request throttling
6. **Input Validation**: Comprehensive DTO validation

## 📈 Scoring Algorithms

### Profile Strength Score
```
Overall = Completeness × 0.25 + Specificity × 0.25 + 
          Consistency × 0.20 + Stability × 0.15 + 
          Behavior × 0.15
```

### Compatibility Score
```
Overall = Values × 0.35 + Lifestyle × 0.25 + 
          Intent × 0.20 + Communication × 0.15 + 
          Logistics × 0.05
```

### Trust Score
```
Overall = ReplyPattern × 0.25 + Commitment × 0.30 + 
          Respect × 0.30 + ToneConsistency × 0.15
```

### Risk Index
```
Risk = ReportScore × 0.40 + MessageRisk × 0.35 + 
       PatternRisk × 0.25 + Multipliers
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/truematch
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3001
```

## 📄 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ for meaningful connections.
