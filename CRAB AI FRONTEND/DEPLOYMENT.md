# Deployment Guide

This project is a React + Vite + Tailwind CSS application with Supabase backend integration.

## Prerequisites

- Node.js 18+ or Bun
- Supabase project (for backend/auth)
- Environment variables configured

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` - Your Supabase project ID

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## Production Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## Render Deployment

### Option 1: Static Site

1. Create a new **Static Site** on Render
2. Connect your GitHub repository
3. Configure build settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add environment variables in Render dashboard
5. Deploy

### Option 2: Web Service (for SSR if needed later)

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
4. Add environment variables
5. Deploy

## Supabase Setup

### Database Tables

The app requires these tables (already configured via migrations):
- `profiles` - User profile information
- `resumes` - User resume data

### Row Level Security (RLS)

All tables have RLS enabled. Users can only access their own data.

### Authentication

The app uses Supabase Auth with email/password authentication.
Auto-confirm is enabled for development.

## FastAPI Backend Integration (Optional)

If connecting to a FastAPI backend:

1. Add `VITE_API_BASE_URL` to your environment variables
2. Create API service functions in `src/services/api.ts`
3. Use fetch or axios to call your FastAPI endpoints

Example:
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const fetchData = async (endpoint: string) => {
  const response = await fetch(`${API_BASE}${endpoint}`);
  return response.json();
};
```

## Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, Theme)
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── integrations/   # Supabase client
│   └── lib/            # Utility functions
├── public/             # Static assets
├── supabase/           # Supabase config
└── dist/               # Production build output
```

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build`
- Verify environment variables are set

### Authentication Issues
- Verify Supabase URL and anon key are correct
- Check Supabase dashboard for auth settings
- Ensure RLS policies allow user operations

### Styling Issues
- Run `npm run build` to ensure Tailwind processes all classes
- Check `tailwind.config.ts` for content paths
