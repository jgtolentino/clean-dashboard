import { describe, it, expect } from 'vitest';

describe('Environment Configuration', () => {
  it('has required environment variables', () => {
    expect(process.env.VITE_SUPABASE_URL).toBeDefined();
    expect(process.env.VITE_SUPABASE_ANON_KEY).toBeDefined();
    expect(process.env.VITE_ODOO_URL).toBeDefined();
    expect(process.env.VITE_ODOO_DB).toBeDefined();
  });

  it('validates Supabase URL format', () => {
    const url = process.env.VITE_SUPABASE_URL;
    expect(url).toMatch(/^https:\/\//);
  });

  it('validates Odoo URL format', () => {
    const url = process.env.VITE_ODOO_URL;
    expect(url).toMatch(/^https:\/\//);
  });
});
