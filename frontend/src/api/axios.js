import axios from 'axios';

const api = axios.create({ baseURL: '/' });

// Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Token refresh logic ─────────────────────────────────────────────
// Prevents multiple simultaneous refresh attempts when several API calls
// fail at once (e.g. on page refresh with an expired token).
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers.forEach((cb) => cb(null));
  refreshSubscribers = [];
}

// Auth endpoints that intentionally return 401 — do NOT intercept these.
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Skip interception for auth endpoints (login, register, refresh).
    // Their 401s are intentional "wrong password" errors, not expired tokens.
    const url = original?.url || '';
    if (AUTH_ENDPOINTS.some((ep) => url.includes(ep))) {
      return Promise.reject(error);
    }

    // Intercept 401 (expired/invalid token) to auto-refresh
    if (status === 401 && !original._retry) {
      original._retry = true;

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (newToken) {
              original.headers.Authorization = `Bearer ${newToken}`;
              resolve(api(original));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;
      const refresh = localStorage.getItem('refresh_token');

      if (refresh) {
        try {
          const { data } = await axios.post('/auth/refresh', {
            refresh_token: refresh,
          });
          const newToken = data.access_token;
          localStorage.setItem('access_token', newToken);
          original.headers.Authorization = `Bearer ${newToken}`;

          onTokenRefreshed(newToken);
          isRefreshing = false;

          return api(original);
        } catch {
          onRefreshFailed();
          isRefreshing = false;
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } else {
        onRefreshFailed();
        isRefreshing = false;
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
