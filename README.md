# Suqi Analytics - Retail Intelligence Platform

TBWA's advanced retail intelligence platform powered by Suqi Analytics. Comprehensive insights into transaction trends, consumer behavior, and market intelligence for data-driven retail strategies.

## 🚀 Features

- 🔐 **Secure Authentication**: Email/password and magic link authentication
- 📊 **Retail Intelligence**: Transaction trends and consumer behavior analytics
- 👤 **User Profiles**: Personalized dashboard and profile management
- 🎨 **Modern UI**: Clean, responsive design with Inter font
- 🔒 **Row-Level Security**: Secure data access with Supabase RLS
- ⚡ **Lightning Fast**: Built with Vite for optimal performance

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: CSS with modern design system
- **Deployment**: Vercel
- **Database**: PostgreSQL with RLS policies

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (project: `spdtwktxdalcfigzeqrz`)

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Environment variables are configured in `.env.local`:

```env
VITE_SUPABASE_URL=https://spdtwktxdalcfigzeqrz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_p7jLR_yMD1wQJE8Go3-Nww_bnOzu-WX
```

### 3. Database Setup

Run the migration to create required tables:

```bash
# Option 1: Using Supabase CLI (recommended)
supabase db push

# Option 2: Using psql
psql "$POSTGRES_URL" -f supabase/migrations/001_profiles_table.sql

# Option 3: Using Supabase Dashboard SQL Editor
# Navigate to https://supabase.com/dashboard/project/spdtwktxdalcfigzeqrz/editor
# Copy contents from supabase/migrations/001_profiles_table.sql
# Paste and run in SQL Editor
```

### 4. Development

```bash
npm run dev
```

App opens at `http://localhost:3000`

## 📁 Project Structure

```
scout-dashboard/
├── src/
│   ├── components/
│   │   ├── Auth.tsx          # Authentication UI
│   │   ├── Auth.css
│   │   ├── Dashboard.tsx     # Main analytics dashboard
│   │   └── Dashboard.css
│   ├── lib/
│   │   └── supabase.ts       # Supabase client
│   ├── App.tsx               # Root component
│   ├── App.css               # Global styles
│   └── main.tsx              # Entry point
├── supabase/
│   └── migrations/
│       └── 001_profiles_table.sql
├── public/
│   ├── favicon.ico
│   └── OG.png                # Open Graph image
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 🗄️ Database Schema

### `profiles` Table

| Column       | Type      | Description                |
|--------------|-----------|----------------------------|
| id           | UUID      | User ID (FK to auth.users) |
| email        | TEXT      | User email                 |
| full_name    | TEXT      | User's full name           |
| avatar_url   | TEXT      | Profile avatar URL         |
| updated_at   | TIMESTAMP | Last update time           |
| created_at   | TIMESTAMP | Profile creation time      |

### RLS Policies

- ✅ Users can view their own profile
- ✅ Users can update their own profile
- ✅ Profiles auto-created on signup

## 🚀 Deployment

### Vercel (Current)

The app is deployed at: **https://scout-dashboard-xi.vercel.app**

To deploy updates:

```bash
# Deploy to production
vercel --prod

# Or using Git (auto-deploy on push to main)
git push origin main
```

### Environment Variables (Vercel)

Set in Vercel Dashboard → Project Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://spdtwktxdalcfigzeqrz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_p7jLR_yMD1wQJE8Go3-Nww_bnOzu-WX
```

## 🔧 Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🔐 Security

- ✅ All API keys in environment variables
- ✅ Row-Level Security (RLS) on all tables
- ✅ Supabase Auth for authentication
- ✅ No sensitive data in localStorage
- ✅ HTTPS only in production

## 📊 Analytics Features (Roadmap)

- [ ] Transaction trend visualization
- [ ] Consumer behavior insights
- [ ] Market intelligence dashboard
- [ ] Real-time data sync
- [ ] Export reports (PDF, Excel)
- [ ] Multi-tenant support

## 🤝 Support

- Supabase Project: `spdtwktxdalcfigzeqrz`
- Deployment: https://scout-dashboard-xi.vercel.app
- Docs: https://supabase.com/docs

## 📄 License

Proprietary - TBWA Internal Use Only
