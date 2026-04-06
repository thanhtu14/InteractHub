import axios from "axios";

// ── Tạo axios instance với base URL ──────────────────────────
const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ───────────────────────────────────────
// Tự động gắn JWT token vào header mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────
// Xử lý lỗi tập trung
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Token hết hạn hoặc không hợp lệ → logout
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    if (status === 403) {
      console.error("Không có quyền truy cập");
    }

    if (status === 500) {
      console.error("Lỗi server, vui lòng thử lại sau");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;