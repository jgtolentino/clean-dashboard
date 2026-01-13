import { getOdooClient } from './lib/odoo/client';
import odooService from './services/odooService';

/**
 * Example: Using Odoo service in your components
 */

// Example 1: Fetch products
async function fetchProducts() {
  try {
    const products = await odooService.products.getAll(50);
    console.log('Products:', products);
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Example 2: Fetch sales orders by date range
async function fetchSalesOrders() {
  try {
    const orders = await odooService.salesOrders.getByDateRange(
      '2026-01-01',
      '2026-01-31'
    );
    console.log('Sales Orders:', orders);
    return orders;
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    throw error;
  }
}

// Example 3: Create a new customer
async function createCustomer() {
  try {
    const customerId = await odooService.partners.create({
      name: 'New Customer',
      email: 'customer@example.com',
      phone: '+1234567890',
      is_company: true,
    });
    console.log('Created customer with ID:', customerId);
    return customerId;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

// Example 4: Direct client usage for custom operations
async function customOdooCall() {
  try {
    const client = getOdooClient();
    
    // Call any Odoo model method
    const result = await client.callMethod(
      'account.invoice',
      'action_invoice_open',
      [[123]], // invoice IDs
      {}
    );
    
    console.log('Custom call result:', result);
    return result;
  } catch (error) {
    console.error('Error in custom Odoo call:', error);
    throw error;
  }
}

// Example 5: React Hook for Odoo data
import { useQuery } from '@tanstack/react-query';

export function useOdooProducts() {
  return useQuery({
    queryKey: ['odoo', 'products'],
    queryFn: () => odooService.products.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useOdooSalesOrders(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['odoo', 'sales-orders', startDate, endDate],
    queryFn: () => odooService.salesOrders.getByDateRange(startDate, endDate),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Example 6: Using in a React component
/*
import { useOdooProducts } from './examples/odoo-usage';

function ProductList() {
  const { data: products, isLoading, error } = useOdooProducts();

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div>
      <h2>Products from Odoo</h2>
      <ul>
        {products?.map((product: any) => (
          <li key={product.id}>
            {product.name} - ${product.list_price}
          </li>
        ))}
      </ul>
    </div>
  );
}
*/

export default {
  fetchProducts,
  fetchSalesOrders,
  createCustomer,
  customOdooCall,
};
