# Vercel Production Checklist

## ✅ Performance Optimization

### Build Configuration
- [x] Vite production build enabled
- [x] Code splitting configured
- [x] Tree shaking enabled
- [x] Minification enabled (esbuild)
- [x] Source maps disabled in production
- [x] Asset optimization configured

### Caching Strategy
- [x] Static assets cached (1 year)
- [x] React Query with stale-while-revalidate
- [x] Vercel Edge Caching enabled

### Bundle Size
- [x] Chunk size warnings configured (1500KB limit)
- [x] Vendor chunks separated
- [x] Dynamic imports for heavy libraries
- [ ] Bundle analyzer reports reviewed

## 🔒 Security

### Headers & CSP
- [x] Security headers configured in vercel.json
- [x] Content Security Policy (CSP) set
- [x] HTTPS enforced (HSTS)
- [x] XSS Protection enabled
- [x] Frame options set (DENY)
- [x] Referrer policy configured

### Environment Variables
- [x] Sensitive keys stored in Vercel
- [x] No secrets in client-side code
- [x] `.env.example` documented
- [ ] Production keys rotated

### API Security
- [x] Supabase RLS policies enabled
- [x] Odoo authentication implemented
- [ ] Rate limiting configured
- [ ] Input validation on all forms

## 📊 Monitoring & Analytics

### Analytics Setup
- [x] Vercel Analytics enabled (@vercel/analytics)
- [x] Speed Insights enabled (@vercel/speed-insights)
- [ ] Error tracking (Sentry/LogRocket)
- [ ] Custom events tracked

### Performance Monitoring
- [ ] Core Web Vitals tracked
- [ ] Lighthouse CI integrated
- [ ] Performance budget set

## 🧪 Testing

### Test Coverage
- [x] Unit tests (Vitest)
- [x] Integration tests (MSW)
- [x] E2E tests (Playwright)
- [ ] Visual regression tests
- [ ] 80%+ code coverage target

### CI/CD
- [x] GitHub Actions workflow
- [ ] Automated tests on PR
- [ ] Preview deployments enabled
- [ ] Production deployment gated

## 🌐 SEO & Accessibility

### SEO
- [x] Meta tags configured
- [x] robots.txt present
- [x] sitemap.xml present
- [ ] Open Graph tags added
- [ ] Schema.org markup

### Accessibility
- [x] ARIA labels used
- [x] Keyboard navigation
- [ ] WCAG 2.1 AA compliant
- [ ] Screen reader tested

## 🚀 Deployment

### Vercel Configuration
- [x] vercel.json configured
- [x] Build commands set
- [x] Output directory specified
- [x] Regions configured (sin1)
- [x] Framework detected (Vite)

### Domain & DNS
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] DNS records verified
- [ ] WWW redirect configured

### Environment Setup
- [ ] Production environment variables set
- [ ] Preview environment configured
- [ ] Development environment synced

## 🔗 Integrations (TBWA Organization)

### Recommended Vercel Integrations
- [ ] **GitHub** - Source control & CI/CD
- [ ] **Slack** - Deployment notifications
- [ ] **Sentry** - Error tracking
- [ ] **Checkly** - Synthetic monitoring
- [ ] **Datadog** - APM & logging
- [ ] **PlanetScale** - Database (alternative to Supabase)
- [ ] **Upstash** - Redis for caching
- [ ] **Split** - Feature flags
- [ ] **LaunchDarkly** - Feature management

### To Enable Integrations
1. Go to https://vercel.com/tbwa/~/integrations
2. Browse available integrations
3. Click "Add Integration"
4. Configure per project or team-wide

### Critical Integrations for Production
```bash
# Install Vercel CLI if not already
npm i -g vercel

# Link to TBWA organization
vercel link --scope tbwa

# Add integration via CLI (example: Sentry)
vercel integration add sentry
```

## 📱 Progressive Web App (PWA)

- [x] manifest.json configured
- [ ] Service worker registered
- [ ] Offline support
- [ ] Install prompts

## 🗃️ Database & Backend

### Supabase
- [x] Connection pooling configured
- [x] Row Level Security (RLS) enabled
- [ ] Backup strategy in place
- [ ] Connection limits monitored

### Odoo Integration
- [x] API client implemented
- [x] Error handling robust
- [ ] Retry logic configured
- [ ] Timeout limits set

## 📈 Performance Targets

- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Total Blocking Time < 300ms

## 🔄 Maintenance

- [ ] Dependency updates scheduled
- [ ] Security audit weekly (npm audit)
- [ ] Performance monitoring weekly
- [ ] Backup verification monthly

## 📝 Documentation

- [x] README.md comprehensive
- [x] DEPLOY.md created
- [x] API documentation
- [ ] Runbook for incidents
- [ ] Architecture diagrams

## 🎯 Go-Live Checklist

Before deploying to production:

1. [ ] Run full test suite: `npm test`
2. [ ] Run E2E tests: `npm run test:e2e`
3. [ ] Check bundle size: `npm run build`
4. [ ] Security audit: `npm audit`
5. [ ] Environment variables verified
6. [ ] Backup database
7. [ ] Test rollback procedure
8. [ ] Monitoring dashboards ready
9. [ ] Team notified
10. [ ] Deploy to production: `vercel --prod`

## 📞 Support & Escalation

- **On-call Engineer**: [Configure in PagerDuty]
- **Vercel Support**: https://vercel.com/support
- **Team Channel**: #tbwa-deployments (Slack)
- **Status Page**: https://vercel-status.com
