import apiClient from './apiClient';

/**
 * Authentication Endpoints
 */
const authApi = {
    // Login a user
    login: (credentials) =>
      apiClient.post('/auth/login', credentials, { withCredentials: true }),

    // Register a new user
    register: (userData) => apiClient.post('/auth/register', userData),

    // Logout the user
    logout: () => apiClient.post('/auth/logout'),

    // Get current user profile/session
    getProfile: () => apiClient.get('/auth/profile'),

    // Forgot password
    forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
};

export default authApi;
