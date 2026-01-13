import { http, HttpResponse } from 'msw';

// Mock Supabase API responses
export const supabaseHandlers = [
  http.get('https://test.supabase.co/rest/v1/*', () => {
    return HttpResponse.json([]);
  }),
  
  http.post('https://test.supabase.co/rest/v1/*', () => {
    return HttpResponse.json({ id: 1 });
  }),
];

// Mock Odoo API responses
export const odooHandlers = [
  http.post('https://test.odoo.com/web/session/authenticate', () => {
    return HttpResponse.json({
      jsonrpc: '2.0',
      id: 1,
      result: 123, // user ID
    });
  }),

  http.post('https://test.odoo.com/web/dataset/search_read', () => {
    return HttpResponse.json({
      jsonrpc: '2.0',
      id: 1,
      result: [
        { id: 1, name: 'Test Product', list_price: 99.99 },
        { id: 2, name: 'Another Product', list_price: 149.99 },
      ],
    });
  }),
];

export const handlers = [...supabaseHandlers, ...odooHandlers];
