// src/services/authService.ts
import axiosInstance from "./Axiosinstance";

export const loginAPI = (email: string, password: string) =>
  axiosInstance.post("/api/auth/login", { email, password });

// export const registerAPI = (data: RegisterFormData) =>
//   axiosInstance.post("/api/auth/register", data);