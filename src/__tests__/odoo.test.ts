import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../test/mocks/server';
import odooService from '../../services/odooService';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Odoo Service', () => {
  it('fetches products successfully', async () => {
    const products = await odooService.products.getAll(10);
    
    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
  });

  it('handles authentication', async () => {
    // The client auto-authenticates on first call
    const products = await odooService.products.getAll(5);
    expect(products.length).toBeGreaterThan(0);
  });
});
