# TrueMatch - Trust-First Dating Platform

A production-ready dating application that prioritizes truth, intent alignment, and safety using AI-powered features. Includes a beautiful Next.js frontend and robust NestJS backend.

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

### Backend
- **Framework**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Cache**: Redis
- **Auth**: JWT with bcrypt
- **API Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📁 Project Structure

```
truematch/
├── backend/                 # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   └── src/
│       ├── modules/
│       │   ├── auth/        # Authentication
│       │   ├── users/       # User management
│       │   ├── profiles/    # Profile & scoring
│       │   ├── onboarding/  # AI questions
│       │   ├── matching/    # Compatibility engine
│       │   ├── messages/    # Chat
│       │   ├── safety/      # Risk & protection
│       │   ├── trust/       # Behavior scoring
│       │   └── ai/          # AI services
│       ├── prisma/          # Database service
│       └── redis/           # Cache service
├── frontend/                # Next.js App
│   └── src/
│       ├── app/             # App Router pages
│       │   ├── page.tsx     # Landing page
│       │   ├── login/       # Authentication
│       │   ├── register/    # Registration
│       │   ├── onboarding/  # Profile setup
│       │   ├── discover/    # Swipe interface
│       │   ├── matches/     # Matches list
│       │   ├── chat/        # Messaging
│       │   ├── profile/     # Profile management
│       │   └── settings/    # Settings
│       ├── components/      # Reusable UI components
│       ├── stores/          # Zustand state management
│       └── lib/             # Utilities & API client
├── docker-compose.yml       # Container orchestration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for local development)
- npm or yarn

### Local Development

#### Backend

1. **Install dependencies**
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
npm run start:dev
```

5. **Access the API**
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

#### Frontend

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env.local
# Edit .env.local with your backend URL
```

3. **Start development server**
```bash
npm run dev
```

4. **Access the app**
- Frontend: http://localhost:3000

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

### Backend Deployment

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
   - Railway will auto-detect and build from the `backend` folder

6. **Set environment variables**:
   ```
   JWT_SECRET=your-secure-random-string-here
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.com
   ```

7. **Generate a domain** in service settings

### Frontend Deployment

1. **Create a new service** in the same Railway project

2. **Set root directory** to `frontend`

3. **Set environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-domain.railway.app
   ```

4. **Deploy** and generate a domain

### Alternative: Deploy Frontend to Vercel

1. Import your repository on [Vercel](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

### Environment Variables

#### Backend
| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | No | Redis connection string |
| `JWT_SECRET` | Yes | Secure random string for JWT |
| `JWT_EXPIRES_IN` | No | Token expiration (default: 7d) |
| `NODE_ENV` | No | Set to `production` |
| `FRONTEND_URL` | No | Frontend URL for CORS |
| `OPENAI_API_KEY` | No | For AI features |

#### Frontend
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |

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

## 🎨 UI Features

### Landing Page
- Beautiful hero section with feature highlights
- Gradient design with pink/purple accent colors
- Clear call-to-action buttons

### Authentication
- Clean login/register forms
- Password strength indicator
- Form validation feedback

### Onboarding
- Step-by-step profile setup wizard
- Progress indicator
- Easy gender/intent selection

### Discovery (Swipe)
- Card-based swipe interface
- Drag-to-swipe with smooth animations
- Photo gallery with navigation
- Like/pass action buttons
- Match celebration modal

### Matches & Chat
- New matches carousel
- Conversation list with unread indicators
- Real-time messaging interface
- Message status indicators

### Profile
- Profile photo gallery
- Trust score display
- Profile strength meter
- Edit capabilities

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

## 📄 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ for meaningful connections.
