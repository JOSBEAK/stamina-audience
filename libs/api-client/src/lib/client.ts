import axios from 'axios';

// Use environment variable or fallback to /api (which will be proxied to localhost:3000)
// Note: When used in frontend, this will be replaced by Vite with the actual environment variable
const API_URL = 'https://audience-management-service.vercel.app/api';

console.log('API_URL configured to:', API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
