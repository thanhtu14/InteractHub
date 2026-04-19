import axiosInstance from "./axiosInstance";
import type { RegisterFormData } from "../schemas/auth.schema";

type ApiRes<T> = { Success: boolean; Message: string; Data: T };

export interface AuthResponse {
  Token: string;
  User: {
    Id: string;
    Username: string;
    Email: string;
    AvatarUrl?: string;
    Roles: string[];
  };
}

export const loginAPI = (email: string, password: string) =>
  axiosInstance
    .post<ApiRes<AuthResponse>>("/api/auth/login", { email, password })
    .then((res) => ({ ...res, data: res.data.Data }));

export const registerAPI = (data: Omit<RegisterFormData, "confirmPassword">) =>
  axiosInstance
    .post<ApiRes<AuthResponse>>("/api/auth/register", data)
    .then((res) => ({ ...res, data: res.data.Data }));