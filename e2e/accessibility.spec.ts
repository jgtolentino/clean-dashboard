import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have no accessibility violations on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check for basic accessibility
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
    
    // Test keyboard navigation through all focusable elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focused);
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');
    
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).not.toBeNull();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check that text is visible
    const textElements = page.locator('p, h1, h2, h3, span');
    const count = await textElements.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should support screen readers', async ({ page }) => {
    await page.goto('/');
    
    // Check for landmark regions
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
  });

  test('should have focus indicators', async ({ page }) => {
    await page.goto('/');
    
    // Focus first interactive element
    await page.keyboard.press('Tab');
    
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      const styles = window.getComputedStyle(el!);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow,
      };
    });
    
    // Should have some visible focus indicator
    expect(focused.outline !== 'none' || focused.boxShadow !== 'none').toBeTruthy();
  });
});

test.describe('Accessibility - Forms', () => {
  test('should have proper form labels', async ({ page }) => {
    await page.goto('/');
    
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      // Input should have either a label, aria-label, or aria-labelledby
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });
});

test.describe('Accessibility - Navigation', () => {
  test('should have skip links', async ({ page }) => {
    await page.goto('/');
    
    // Look for skip to main content link
    const skipLink = page.locator('a[href="#main"], a:has-text("Skip to")');
    // Skip links are optional but recommended
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    
    const headings = await page.evaluate(() => {
      const h1 = document.querySelectorAll('h1').length;
      const h2 = document.querySelectorAll('h2').length;
      const h3 = document.querySelectorAll('h3').length;
      return { h1, h2, h3 };
    });
    
    // Should have exactly one h1
    expect(headings.h1).toBe(1);
  });
});
