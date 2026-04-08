import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://localhost:7069",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động gắn JWT token vào header mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("interact_hub_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi tập trung
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const currentPath = window.location.pathname;
      // Token hết hạn trong khi đang dùng app → tự động logout
      if (currentPath !== "/login") {
        localStorage.removeItem("interact_hub_token");
        localStorage.removeItem("interact_hub_user");
        window.location.href = "/login";
      }
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