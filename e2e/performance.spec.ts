import { test, expect } from '@playwright/test';

test.describe('Performance Metrics', () => {
  test('should meet Lighthouse performance targets', async ({ page }) => {
    await page.goto('/');
    
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint').find((entry) => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint').find((entry) => entry.name === 'first-contentful-paint')?.startTime || 0,
      };
    });
    
    // Performance targets
    expect(metrics.firstContentfulPaint).toBeLessThan(1800); // < 1.8s
    expect(metrics.domContentLoaded).toBeLessThan(2000); // < 2s
  });

  test('should have efficient resource loading', async ({ page }) => {
    await page.goto('/');
    
    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return entries.map(entry => ({
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize,
      }));
    });
    
    // Check that no single resource takes too long
    const slowResources = resources.filter(r => r.duration > 2000);
    expect(slowResources.length).toBeLessThan(3);
  });

  test('should have acceptable Total Blocking Time', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const tbt = await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalBlockingTime = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              totalBlockingTime += entry.duration - 50;
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(totalBlockingTime);
        }, 5000);
      });
    });
    
    // TBT should be under 300ms
    expect(tbt).toBeLessThan(300);
  });

  test('should have optimized bundle sizes', async ({ page }) => {
    const response = await page.goto('/');
    const content = await response?.body();
    const size = content?.length || 0;
    
    // HTML should be under 50KB
    expect(size).toBeLessThan(50 * 1024);
  });
});

test.describe('Memory Leaks', () => {
  test('should not leak memory on navigation', async ({ page }) => {
    await page.goto('/');
    
    const initialMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Navigate multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/dashboard');
      await page.goto('/');
    }
    
    const finalMemory = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory.usedJSHeapSize;
      }
      return 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      // Memory shouldn't grow by more than 50%
      expect(finalMemory).toBeLessThan(initialMemory * 1.5);
    }
  });
});

test.describe('Cache Performance', () => {
  test('should cache static assets', async ({ page }) => {
    await page.goto('/');
    
    // Second visit should use cache
    await page.reload();
    
    const cachedResources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return entries.filter(entry => 
        entry.name.includes('/assets/') && entry.transferSize === 0
      ).length;
    });
    
    expect(cachedResources).toBeGreaterThan(0);
  });
});
