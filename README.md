# Scout Dashboard - Retail Intelligence Platform

TBWA's advanced retail intelligence platform powered by Suqi Analytics. Comprehensive insights into transaction trends, consumer behavior, and market intelligence for data-driven retail strategies.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Production Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Set Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables

Required environment variables (set in Vercel dashboard or `.env.local`):

```env
VITE_SUPABASE_URL=https://spdtwktxdalcfigzeqrz.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 📋 Production Checklist

### ✅ Performance
- [x] Asset caching headers configured (1 year for static assets)
- [x] DNS prefetch for Supabase
- [x] Font preloading (Inter)
- [x] TypeScript type checking in build
- [x] Vite production optimizations enabled

### ✅ Security
- [x] Security headers configured (CSP, X-Frame-Options, etc.)
- [x] Environment variables properly configured
- [x] No sensitive data in client bundle
- [x] HTTPS enforced via Vercel

### ✅ SEO & Social
- [x] Meta tags (title, description)
- [x] Open Graph tags for social sharing
- [x] Twitter Card tags
- [x] Favicon configured
- [x] robots.txt present

### ✅ Build Configuration
- [x] TypeScript project references
- [x] Strict type checking enabled
- [x] ESLint configuration
- [x] Vercel configuration file
- [x] .vercelignore for build optimization

### ✅ Monitoring & Analytics
- [ ] Error tracking (Sentry/Vercel Analytics)
- [ ] Performance monitoring
- [ ] User analytics
- [ ] Uptime monitoring

## 🛠️ Tech Stack

- **Framework:** React 18.2 + TypeScript 5.2
- **Build Tool:** Vite 5.0
- **Database:** Supabase PostgreSQL
- **Visualization:** Chart.js, Recharts, Plotly.js
- **Maps:** Mapbox GL
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## 📊 Data Sources

The platform analyzes:
- 21,154+ retail transactions from sari-sari stores
- Campaign performance data
- Consumer behavior metrics
- Geographic sales patterns

## 🔐 Security

Production security measures:
- Content Security Policy headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- XSS Protection enabled
- Referrer-Policy configured
- Permissions-Policy configured

## 📖 Documentation

- [Vercel Production Checklist](https://vercel.com/docs/production-checklist)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)

## 🌍 Deployment Regions

Primary region: Singapore (sin1)

## 📝 License

Copyright © 2025 TBWA. All rights reserved.
