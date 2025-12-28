# TrueMatch Frontend

A modern, beautiful dating application frontend built with Next.js 16, React, and Tailwind CSS.

## Features

- 📱 **Mobile-first responsive design**
- 💖 **Swipe-based discovery** with smooth animations
- 💬 **Real-time messaging** interface
- 🔐 **Secure authentication** with JWT
- 🎨 **Beautiful UI** with gradient accents
- ⚡ **Fast performance** with Next.js App Router

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your backend URL
# NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx         # Landing page
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── onboarding/      # Onboarding flow
│   │   ├── discover/        # Swipe/discovery page
│   │   ├── matches/         # Matches list
│   │   ├── chat/            # Chat interface
│   │   ├── profile/         # User profile
│   │   └── settings/        # App settings
│   ├── components/          # Reusable UI components
│   │   ├── Navigation.tsx   # Bottom navigation
│   │   ├── Button.tsx       # Button component
│   │   ├── Input.tsx        # Input component
│   │   ├── Card.tsx         # Card component
│   │   ├── Modal.tsx        # Modal component
│   │   ├── Avatar.tsx       # Avatar component
│   │   └── Toast.tsx        # Toast notifications
│   ├── lib/                 # Utilities
│   │   ├── api.ts           # API client
│   │   └── utils.ts         # Helper functions
│   └── stores/              # Zustand stores
│       ├── auth.ts          # Authentication state
│       ├── profile.ts       # Profile state
│       └── matches.ts       # Matches/discovery state
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind configuration
└── next.config.js           # Next.js configuration
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero section |
| `/login` | User login |
| `/register` | New user registration |
| `/onboarding` | Profile setup wizard |
| `/discover` | Swipe through profiles |
| `/matches` | View matches and conversations |
| `/chat/[matchId]` | Chat with a match |
| `/profile` | View/edit your profile |
| `/settings` | App settings |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |

## Deployment

### Railway

1. Create a new service from your repository
2. Set the root directory to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

### Vercel

1. Import your repository
2. Set the root directory to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy!

### Docker

```bash
docker build -t truematch-frontend --build-arg NEXT_PUBLIC_API_URL=https://your-api.com .
docker run -p 3000:3000 truematch-frontend
```

## Design System

### Colors

- **Primary:** Pink gradient (#ec4899 to #db2777)
- **Secondary:** Purple gradient (#8b5cf6 to #7c3aed)
- **Background:** Light gradient (pink to purple tint)

### Typography

- **Font:** Inter
- **Headings:** Bold, gradient text for emphasis
- **Body:** Regular, gray tones

### Components

All components are designed with:
- Rounded corners (xl/2xl)
- Subtle shadows
- Smooth transitions
- Mobile-first approach

## License

MIT
