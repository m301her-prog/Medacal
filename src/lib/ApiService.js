const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://medacal.vercel.app').replace(/\/$/, '');

export const API_ENDPOINTS = Object.freeze({
  chat: `${API_ORIGIN}/api/chat`,
  customers: `${API_ORIGIN}/api/customers`,
  dashboard: `${API_ORIGIN}/api/dashboard`,
  integrations: `${API_ORIGIN}/api/integrations`,
  medicines: `${API_ORIGIN}/api/medicines`,
  sales: `${API_ORIGIN}/api/sales`,
});

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function headers(extra = {}) {
  return { Accept: 'application/json', 'Content-Type': 'application/json', ...extra };
}

async function request(url, {method = 'GET', body, signal, headers: extraHeaders} = {}) {
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: headers(extraHeaders),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      credentials: 'omit',
    });
  } catch (error) {
    throw new ApiError('تعذر الاتصال بخادم البيانات. تحقق من الإنترنت أو رابط الباك اند.', 0, error);
  }

  const contentType = response.headers.get('content-type') || '';
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : {}; } catch {
    if (contentType.includes('text/html') || raw.trim().startsWith('<!')) {
      throw new ApiError(`رابط API أعاد صفحة HTML بدل JSON: ${url}. تأكد من نشر Serverless API على Vercel.`, response.status, raw.slice(0, 160));
    }
    throw new ApiError('استجابة غير صالحة من خادم البيانات.', response.status, raw.slice(0, 160));
  }
  if (!response.ok || data.error) throw new ApiError(data.error || `فشل الطلب (${response.status})`, response.status, data);
  return data;
}

const service = {
  endpoints: API_ENDPOINTS,
  get: (resource, options) => request(API_ENDPOINTS[resource] || resource, {method: 'GET', ...options}),
  post: (resource, body, options) => request(API_ENDPOINTS[resource] || resource, {method: 'POST', body, ...options}),
  put: (resource, body, options) => request(API_ENDPOINTS[resource] || resource, {method: 'PUT', body, ...options}),
  delete: (resource, query = '', options) => request(`${API_ENDPOINTS[resource] || resource}${query ? `?${new URLSearchParams(query)}` : ''}`, {method: 'DELETE', ...options}),
  chat: (message, history = [], options) => request(API_ENDPOINTS.chat, {method: 'POST', body: {message, history}, ...options}),
  listMedicines: (query = '', options) => request(`${API_ENDPOINTS.medicines}${query ? `?q=${encodeURIComponent(query)}` : ''}`, {method: 'GET', ...options}),
  createMedicine: (medicine, options) => request(API_ENDPOINTS.medicines, {method: 'POST', body: medicine, ...options}),
  removeMedicine: (id, options) => request(API_ENDPOINTS.medicines, {method: 'DELETE', body: {id}, ...options}),
  listCustomers: (options) => request(API_ENDPOINTS.customers, {method: 'GET', ...options}),
  listSales: (options) => request(API_ENDPOINTS.sales, {method: 'GET', ...options}),
  createSale: (sale, options) => request(API_ENDPOINTS.sales, {method: 'POST', body: sale, ...options}),
  dashboard: (options) => request(API_ENDPOINTS.dashboard, {method: 'GET', ...options}),
  integration: (payload, options) => request(API_ENDPOINTS.integrations, {method: 'POST', body: payload, ...options}),
};

export default service;
