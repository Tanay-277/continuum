import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

// Base API URL - can be overridden via environment variable
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance for internal API routes
export const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for API client
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    console.error("[API Client] Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for API client
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "[API Client] Response Error:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("[API Client] No response received:", error.request);
    } else {
      console.error("[API Client] Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// RAWG API client for server-side use only
export const  rawgClient: AxiosInstance = axios.create({
  baseURL: "https://api.rawg.io/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// RAWG request interceptor to add API key
rawgClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const apiKey = process.env.NEXT_PUBLIC_RAWG_API_KEY || process.env.RAWG_API_KEY;

    if (!apiKey) {
      console.error("[RAWG API] API KEY MISSING");
      return Promise.reject(new Error("RAWG API KEY MISSING"));
    }

    // Add API key to query params
    if (config.url) {
      const separator = config.url.includes("?") ? "&" : "?";
      config.url = `${config.url}${separator}key=${apiKey}`;
      console.log(config.url);
    }

    return config;
  },
  (error) => {
    console.error("[RAWG API] Request Error:", error);
    return Promise.reject(error);
  }
);

// RAWG response interceptor
rawgClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "[RAWG API] Response Error:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("[RAWG API] No response received:", error.request);
    } else {
      console.error("[RAWG API] Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// IGDB API client for server-side use only
export const igdbClient: AxiosInstance = axios.create({
  baseURL: "https://api.igdb.com/v4",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// IGDB request interceptor to add auth headers
igdbClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const clientId = process.env.CLIENT_ID;
    const accessToken = process.env.ACCESS_TOKEN;

    if (!clientId || !accessToken) {
      console.error("[IGDB API] CLIENT_ID or ACCESS_TOKEN MISSING");
      return Promise.reject(new Error("IGDB credentials missing"));
    }

    config.headers["Client-ID"] = clientId;
    config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
  },
  (error) => {
    console.error("[IGDB API] Request Error:", error);
    return Promise.reject(error);
  }
);

// IGDB response interceptor
igdbClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "[IGDB API] Response Error:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("[IGDB API] No response received:", error.request);
    } else {
      console.error("[IGDB API] Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;