import { auth } from '../firebase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function request(path, { method = 'GET', body } = {}) {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // Products
  getProducts: () => request('/products'),
  searchProducts: (q) => request(`/products/search?q=${encodeURIComponent(q)}`),
  getLowStock: () => request('/products/low-stock'),
  addProduct: (data) => request('/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Sales / POS
  createSale: (data) => request('/sales', { method: 'POST', body: data }),
  getTodaySummary: () => request('/sales/today'),
  getSale: (id) => request(`/sales/${id}`),

  // Customers
  getCustomers: (q = '') => request(`/customers${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getCustomer: (id) => request(`/customers/${id}`),
  addCustomer: (data) => request('/customers', { method: 'POST', body: data }),
  recordPayment: (id, amount) => request(`/customers/${id}/payment`, { method: 'POST', body: { amount } }),
};
