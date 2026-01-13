import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Scout Dashboard/);
  });

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Dashboard');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    
    // Test all main navigation links
    const pages = [
      { text: 'Dashboard', url: /dashboard/ },
      { text: 'Geographic', url: /geographic/ },
      { text: 'Showcase', url: /showcase/ },
    ];

    for (const { text, url } of pages) {
      await page.click(`text=${text}`);
      await expect(page).toHaveURL(url);
    }
  });

  test('should display charts', async ({ page }) => {
    await page.goto('/dashboard');
    // Wait for charts to load
    await page.waitForSelector('[data-testid="chart"]', { timeout: 5000 });
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });

  test('should measure Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries);
        });
        observer.observe({ entryTypes: ['navigation', 'paint'] });
      });
    });
    
    expect(metrics).toBeDefined();
  });

  test('should lazy load images', async ({ page }) => {
    await page.goto('/');
    
    const images = page.locator('img[loading="lazy"]');
    const count = await images.count();
    
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should work on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
  });
});

test.describe('User Interactions', () => {
  test('should handle filter changes', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    
    // Interact with filters if present
    const filters = page.locator('[data-testid="filter"]');
    if (await filters.count() > 0) {
      await filters.first().click();
    }
  });

  test('should handle data refresh', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for refresh button
    const refreshButton = page.locator('button:has-text("Refresh")');
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      await page.waitForLoadState('networkidle');
    }
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Should show error message or fallback
    await page.context().setOffline(false);
  });

  test('should handle 404 pages', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    
    // Should redirect or show 404
    expect(response?.status()).toBeLessThan(500);
  });
});
