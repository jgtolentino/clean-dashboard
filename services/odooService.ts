import { getOdooClient } from '../lib/odoo/client';

/**
 * Odoo Service - High-level API for common Odoo operations
 */

// Product operations
export const odooProducts = {
  getAll: async (limit = 100) => {
    const client = getOdooClient();
    return client.searchRead('product.product', [], [
      'name',
      'default_code',
      'list_price',
      'standard_price',
      'qty_available',
      'categ_id',
    ], { limit });
  },

  getById: async (id: number) => {
    const client = getOdooClient();
    return client.searchRead('product.product', [['id', '=', id]], [
      'name',
      'default_code',
      'list_price',
      'standard_price',
      'qty_available',
      'categ_id',
      'description',
    ]);
  },

  create: async (productData: any) => {
    const client = getOdooClient();
    return client.create('product.product', productData);
  },

  update: async (id: number, productData: any) => {
    const client = getOdooClient();
    return client.write('product.product', [id], productData);
  },
};

// Sales Order operations
export const odooSalesOrders = {
  getAll: async (limit = 100, offset = 0) => {
    const client = getOdooClient();
    return client.searchRead('sale.order', [], [
      'name',
      'partner_id',
      'date_order',
      'amount_total',
      'state',
    ], { limit, offset, order: 'date_order desc' });
  },

  getByDateRange: async (startDate: string, endDate: string) => {
    const client = getOdooClient();
    return client.searchRead('sale.order', [
      ['date_order', '>=', startDate],
      ['date_order', '<=', endDate],
    ], [
      'name',
      'partner_id',
      'date_order',
      'amount_total',
      'state',
      'order_line',
    ]);
  },

  create: async (orderData: any) => {
    const client = getOdooClient();
    return client.create('sale.order', orderData);
  },
};

// Partner/Customer operations
export const odooPartners = {
  getAll: async (limit = 100) => {
    const client = getOdooClient();
    return client.searchRead('res.partner', [['is_company', '=', true]], [
      'name',
      'email',
      'phone',
      'city',
      'country_id',
    ], { limit });
  },

  search: async (searchTerm: string) => {
    const client = getOdooClient();
    return client.searchRead('res.partner', [
      '|',
      ['name', 'ilike', searchTerm],
      ['email', 'ilike', searchTerm],
    ], ['name', 'email', 'phone', 'city']);
  },

  create: async (partnerData: any) => {
    const client = getOdooClient();
    return client.create('res.partner', partnerData);
  },
};

// Inventory operations
export const odooInventory = {
  getStock: async (productId?: number) => {
    const client = getOdooClient();
    const domain = productId ? [['product_id', '=', productId]] : [];
    return client.searchRead('stock.quant', domain, [
      'product_id',
      'location_id',
      'quantity',
      'reserved_quantity',
    ]);
  },

  getStockMoves: async (limit = 100) => {
    const client = getOdooClient();
    return client.searchRead('stock.move', [], [
      'name',
      'product_id',
      'product_uom_qty',
      'date',
      'state',
      'location_id',
      'location_dest_id',
    ], { limit, order: 'date desc' });
  },
};

// Analytics/Reporting
export const odooAnalytics = {
  getSalesReport: async (startDate: string, endDate: string) => {
    const client = getOdooClient();
    // This would call a custom report method in Odoo
    return client.callMethod('sale.report', 'read_group', [], {
      domain: [
        ['date', '>=', startDate],
        ['date', '<=', endDate],
      ],
      fields: ['product_id', 'price_total', 'product_uom_qty'],
      groupby: ['product_id'],
    });
  },
};

export default {
  products: odooProducts,
  salesOrders: odooSalesOrders,
  partners: odooPartners,
  inventory: odooInventory,
  analytics: odooAnalytics,
};
