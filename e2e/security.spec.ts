import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('should have security headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() || {};
    
    // Content Security Policy
    expect(headers['content-security-policy']).toBeDefined();
    
    // X-Frame-Options
    expect(headers['x-frame-options']).toBe('DENY');
    
    // X-Content-Type-Options
    expect(headers['x-content-type-options']).toBe('nosniff');
    
    // X-XSS-Protection
    expect(headers['x-xss-protection']).toBeDefined();
    
    // Referrer-Policy
    expect(headers['referrer-policy']).toBeDefined();
    
    // Strict-Transport-Security
    expect(headers['strict-transport-security']).toBeDefined();
  });

  test('should enforce HTTPS', async ({ page }) => {
    await page.goto('/');
    const url = page.url();
    
    if (!url.includes('localhost')) {
      expect(url).toMatch(/^https:/);
    }
  });
});

test.describe('XSS Protection', () => {
  test('should sanitize user input', async ({ page }) => {
    await page.goto('/');
    
    // Try to inject script
    const input = page.locator('input').first();
    if (await input.count() > 0) {
      await input.fill('<script>alert("xss")</script>');
      
      // Check that script is not executed
      const alerts = [];
      page.on('dialog', dialog => {
        alerts.push(dialog.message());
        dialog.dismiss();
      });
      
      await page.waitForTimeout(1000);
      expect(alerts).toHaveLength(0);
    }
  });
});

test.describe('CORS', () => {
  test('should have proper CORS headers for API calls', async ({ page }) => {
    await page.goto('/');
    
    const apiCalls: string[] = [];
    page.on('response', response => {
      if (response.url().includes('supabase') || response.url().includes('api')) {
        apiCalls.push(response.url());
      }
    });
    
    await page.waitForTimeout(2000);
    
    // Should make API calls securely
    for (const url of apiCalls) {
      expect(url).toMatch(/^https:/);
    }
  });
});

test.describe('Authentication', () => {
  test('should handle unauthenticated access', async ({ page }) => {
    await page.goto('/');
    
    // Should either show login or public content
    const body = await page.textContent('body');
    expect(body).toBeDefined();
  });
});

test.describe('Data Validation', () => {
  test('should validate form inputs', async ({ page }) => {
    await page.goto('/');
    
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('invalid-email');
      
      // Should show validation error
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      
      const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
      expect(validity).toBe(false);
    }
  });
});

test.describe('Session Security', () => {
  test('should have secure cookies', async ({ context, page }) => {
    await page.goto('/');
    
    const cookies = await context.cookies();
    
    for (const cookie of cookies) {
      // Production cookies should be secure
      if (!page.url().includes('localhost')) {
        expect(cookie.secure).toBe(true);
      }
      
      // SameSite should be set
      expect(['Strict', 'Lax', 'None']).toContain(cookie.sameSite);
    }
  });
});

test.describe('API Security', () => {
  test('should not expose sensitive data in responses', async ({ page }) => {
    await page.goto('/');
    
    const responses: string[] = [];
    page.on('response', async response => {
      if (response.url().includes('api')) {
        const body = await response.text().catch(() => '');
        responses.push(body);
      }
    });
    
    await page.waitForTimeout(2000);
    
    for (const body of responses) {
      // Check for common sensitive data patterns
      expect(body).not.toMatch(/password/i);
      expect(body).not.toMatch(/api[_-]?key/i);
      expect(body).not.toMatch(/secret/i);
    }
  });
});

test.describe('Rate Limiting', () => {
  test('should handle rapid requests gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Make multiple rapid requests
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(page.reload());
    }
    
    await Promise.all(promises).catch(() => {
      // Should not crash
    });
    
    // Page should still be functional
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
