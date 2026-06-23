import axios from "axios";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds execution timeout limit
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response.data, 
  (error) => {
    const customError = {
      message: error.response?.data?.message || "An unexpected network error occurred",
      status: error.response?.status || 500,
      data: error.response?.data?.data || null,
    };

    console.error("Axios API intercept exception trace mapping:", customError);
    return Promise.reject(customError);
  }
);

export default api;