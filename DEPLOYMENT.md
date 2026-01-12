# Deployment Guide - Scout Dashboard

## 🚀 Vercel Deployment (Recommended)

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Link project (first time only)
vercel link

# Set environment variables
vercel env add VITE_SUPABASE_URL production
# Paste: https://spdtwktxdalcfigzeqrz.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste: sb_publishable_p7jLR_yMD1wQJE8Go3-Nww_bnOzu-WX

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. **Connect Repository**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Vite framework

2. **Configure Build Settings**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL` = `https://spdtwktxdalcfigzeqrz.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_p7jLR_yMD1wQJE8Go3-Nww_bnOzu-WX`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Option 3: Deploy via Vercel Dashboard

1. **Upload Project**
   ```bash
   # Create production build
   npm run build
   
   # Zip the project (excluding node_modules)
   zip -r scout-dashboard.zip . -x "node_modules/*" ".git/*"
   ```

2. **Upload to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Choose "Upload" option
   - Upload `scout-dashboard.zip`
   - Configure environment variables
   - Deploy

## 🔧 Configuration

### Required Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://spdtwktxdalcfigzeqrz.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_p7jLR_yMD1wQJE8Go3-Nww_bnOzu-WX` | Supabase anonymous key |

### Optional Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `VITE_VERCEL_ANALYTICS_ID` | `prj_xxx` | Vercel Analytics tracking |
| `VITE_GOOGLE_ANALYTICS_ID` | `G-XXXXXXXXXX` | Google Analytics tracking |
| `VITE_ENABLE_BETA_FEATURES` | `false` | Enable experimental features |

## 📋 Pre-Deployment Checklist

```bash
# 1. Run type check
npm run type-check

# 2. Run linter
npm run lint

# 3. Build locally
npm run build

# 4. Preview build
npm run preview
# Test at http://localhost:4173

# 5. Check bundle size
du -sh dist/

# 6. Verify environment variables
cat .env.local
```

## 🌍 Custom Domain Setup

### Add Custom Domain

```bash
# Via CLI
vercel domains add yourdomain.com

# Verify domain
vercel domains verify yourdomain.com
```

### DNS Configuration

Add these records to your DNS provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## 📊 Post-Deployment Verification

### 1. Health Check
```bash
curl -I https://your-project.vercel.app/
# Should return: HTTP/2 200
```

### 2. Environment Variables
```bash
# Check Supabase connection
curl https://your-project.vercel.app/ | grep "spdtwktxdalcfigzeqrz"
```

### 3. Security Headers
```bash
curl -I https://your-project.vercel.app/ | grep -E "X-Frame|X-Content|X-XSS"
# Should show security headers
```

### 4. Performance
- Open https://your-project.vercel.app/
- Check Chrome DevTools → Lighthouse
- Target: Performance >90, Accessibility >90

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

### Deployment Workflow

```
git push origin main
  ↓
Vercel detects push
  ↓
Runs: npm run build
  ↓
Deploys to production
  ↓
Your site is live!
```

## 🚨 Rollback Procedure

### Via Vercel Dashboard
1. Go to Deployments page
2. Find previous successful deployment
3. Click "Promote to Production"

### Via CLI
```bash
# List deployments
vercel list

# Rollback to specific deployment
vercel rollback [deployment-url]
```

## 📈 Monitoring

### Vercel Analytics
```bash
# Enable Speed Insights
vercel env add NEXT_PUBLIC_VERCEL_ANALYTICS_ID production
```

### Error Tracking
- Consider adding Sentry: https://sentry.io/
- Or use Vercel Error Monitoring

## 🔐 Security Best Practices

1. **Never commit secrets**
   - Use Vercel environment variables
   - Keep `.env.local` in `.gitignore`

2. **Enable security headers**
   - Already configured in `vercel.json`
   - CSP, X-Frame-Options, etc.

3. **HTTPS only**
   - Enforced automatically by Vercel
   - All HTTP redirects to HTTPS

4. **Regular updates**
   ```bash
   npm audit
   npm update
   ```

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev/

## 🎯 Quick Reference

```bash
# Development
npm run dev                  # Start dev server

# Production Build
npm run build               # Build for production
npm run preview             # Preview production build

# Deployment
vercel                      # Deploy preview
vercel --prod              # Deploy to production

# Environment
vercel env ls              # List environment variables
vercel env add VAR_NAME    # Add environment variable
vercel env rm VAR_NAME     # Remove environment variable

# Domains
vercel domains ls          # List domains
vercel domains add DOMAIN  # Add domain

# Logs
vercel logs [URL]          # View deployment logs
```

---

**Last Updated**: 2025-01-12
**Deployment Region**: Singapore (sin1)
**CDN**: Global Vercel Edge Network
