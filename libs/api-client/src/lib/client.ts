import axios from 'axios';

// Use environment variable or fallback to deployed backend
// Note: When used in frontend, this will be replaced by Vite with the actual environment variable
const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://audience-management-service-besysv2m8.vercel.app/api';

console.log('API_URL configured to:', API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
