import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const BASE_URL = rawBaseUrl.replace(/\/$/, "").endsWith("/api")
  ? rawBaseUrl.replace(/\/$/, "")
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

/**
 * Simple Axios Instance
 * This allows us to set a common base URL and other configurations
 * for all our API calls.
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Needed if your backend uses cookies for auth
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * This runs before every request is sent.
 * You can use this to add auth tokens to headers.
 */
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * This runs after every response is received.
 * Great for centralizing error handling.
 */
apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === "object" && "data" in payload) {
      return payload.data;
    }
    return payload;
  },
  (error) => {
    const backendMessage = error.response?.data?.message;
    if (backendMessage) {
      error.message = backendMessage;
    }

    console.error("API Error:", backendMessage || error.message);

    return Promise.reject(error);
  }
);

export default apiClient;
