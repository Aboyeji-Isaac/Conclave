import axios from 'axios';

// Central axios instance — every page/component should call through this,
// not axios directly, so the auth header attaches consistently.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// TODO: add a response interceptor that calls POST /auth/refresh on a 401
// and retries the original request once.
