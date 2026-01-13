# Comprehensive Testing Guide

## Test Suite Overview

Your dashboard now has complete test coverage across all layers:

### 🧪 Test Types

1. **Unit Tests** - Individual component logic
2. **Integration Tests** - Service and API integration
3. **E2E Tests** - Full user workflows
4. **Performance Tests** - Speed and resource usage
5. **Security Tests** - Security headers and vulnerabilities
6. **Accessibility Tests** - WCAG compliance

## Running Tests

```bash
# Unit & Integration Tests
npm test                    # Run once
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
npm run test:ui            # Visual UI

# E2E Tests
npm run test:e2e           # All browsers
npm run test:e2e:ui        # Interactive mode
npm run test:e2e:chromium  # Chrome only
npm run test:e2e:firefox   # Firefox only
npm run test:e2e:webkit    # Safari only
npm run test:e2e:headed    # Watch tests run

# All Tests
npm run test:all           # Run everything

# Type Checking
npm run typecheck

# Linting
npm run lint

# Performance
npm run lighthouse         # Lighthouse CI
```

## Test Files Structure

```
src/__tests__/
├── components.test.ts      # Component unit tests
├── integration.test.ts     # API integration tests
├── config.test.ts          # Configuration tests
├── supabase.test.ts        # Supabase tests
├── odoo.test.ts            # Odoo tests
└── fluentui.test.tsx       # FluentUI tests

e2e/
├── dashboard.spec.ts       # Dashboard workflows
├── accessibility.spec.ts   # A11y compliance
├── performance.spec.ts     # Performance metrics
└── security.spec.ts        # Security checks
```

## CI/CD Pipeline

### Automated Testing on GitHub

The pipeline runs on every push and PR:

1. **Lint & Type Check** - Code quality
2. **Unit Tests** - Component logic
3. **E2E Tests** - All browsers (Chromium, Firefox, WebKit)
4. **Lighthouse CI** - Performance scoring
5. **Security Scan** - Vulnerability checks
6. **Build** - Production build
7. **Deploy** - Vercel deployment

### GitHub Actions Workflows

- `.github/workflows/ci-cd.yml` - Main pipeline
- `.github/workflows/vercel-production.yml` - Production deploys
- `.github/workflows/vercel-preview.yml` - PR previews

## Required GitHub Secrets

Set these in GitHub Settings → Secrets:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_ODOO_URL
VITE_ODOO_DB
VITE_ODOO_USERNAME
VITE_ODOO_PASSWORD
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
LHCI_GITHUB_APP_TOKEN      # Optional: Lighthouse CI
SNYK_TOKEN                  # Optional: Security scanning
```

## Test Coverage Goals

- **Unit Tests**: >80% coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user paths
- **Performance**: Lighthouse >90 score
- **Accessibility**: WCAG AA compliance

## Performance Targets

- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.8s
- **Total Blocking Time**: < 300ms
- **Cumulative Layout Shift**: < 0.1

## Security Checks

- ✅ Security headers (CSP, HSTS, etc.)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Input validation
- ✅ Secure cookies
- ✅ No sensitive data exposure
- ✅ Rate limiting

## Accessibility Standards

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Color contrast
- ✅ Focus indicators
- ✅ Alt text for images
- ✅ Form labels

## Local Development Testing

### Before Committing
```bash
# 1. Run type check
npm run typecheck

# 2. Run linter
npm run lint

# 3. Run unit tests
npm test

# 4. Build check
npm run build:check
```

### Before Creating PR
```bash
# Run full test suite
npm run test:all

# Run Lighthouse
npm run lighthouse

# Check build size
npm run analyze
```

## Debugging Tests

### Vitest
```bash
# Run specific test file
npm test src/__tests__/components.test.ts

# Watch mode with filter
npm run test:watch -- -t "KPI Card"

# Debug in VS Code
# Use "JavaScript Debug Terminal" and run npm test
```

### Playwright
```bash
# Debug mode
npx playwright test --debug

# UI mode (recommended)
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Generate test code
npx playwright codegen http://localhost:4173
```

## Continuous Monitoring

### Vercel Analytics
- Speed Insights
- Web Vitals
- Real User Monitoring

### Lighthouse CI
- Automated performance testing
- Trend tracking
- Budget enforcement

### Error Tracking
- Consider: Sentry, LogRocket, or Bugsnag
- Server-side logging
- Client-side error boundaries

## Best Practices

1. **Write tests first** (TDD when possible)
2. **Test user behavior**, not implementation
3. **Keep tests isolated** and independent
4. **Mock external dependencies**
5. **Use descriptive test names**
6. **Maintain test data** separately
7. **Run tests before pushing**
8. **Review test coverage** regularly

## Troubleshooting

### Tests Failing Locally
```bash
# Clear cache
rm -rf node_modules/.vite
npm run test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### E2E Tests Timing Out
```bash
# Increase timeout in playwright.config.ts
timeout: 30000  // 30 seconds
```

### Flaky Tests
- Add proper wait conditions
- Use `waitForLoadState('networkidle')`
- Avoid `waitForTimeout`, use `waitForSelector`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Vercel Documentation](https://vercel.com/docs)
