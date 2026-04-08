import axiosInstance from "./axiosInstance"; // ✅ chữ I hoa
import type { RegisterFormData } from "../components/FormRegister";

export const loginAPI = (email: string, password: string) =>
  axiosInstance.post("/api/auth/login", { email, password });

export const registerAPI = (data: Omit<RegisterFormData, "confirmPassword">) =>
  axiosInstance.post("/api/auth/register", data);