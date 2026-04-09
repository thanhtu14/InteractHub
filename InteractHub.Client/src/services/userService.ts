import axiosInstance from "./axiosInstance";
import { type User, type ProfileUpdateData } from "../schemas/user.schema";

export const userService = {
  // ── LẤY DỮ LIỆU ──────────────────────────────────────────
  getProfileMe: () => 
    axiosInstance.get<User>("/api/users/me"),

  getUserById: (id: string) => 
    axiosInstance.get<User>(`/api/users/${id}`),

  getProfile: (id?: string) => {
    return id ? userService.getUserById(id) : userService.getProfileMe();
  },

  // ── CẬP NHẬT DỮ LIỆU ─────────────────────────────────────
  
  // Cập nhật thông tin profile (JSON)
  updateProfile: (data: ProfileUpdateData) => {
    return axiosInstance.put<User>("/api/users/update", data);
  },

  // Upload ảnh đại diện (FormData)
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post<{ url: string }>("/api/users/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Upload ảnh bìa (FormData)
  uploadCover: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance.post<{ url: string }>("/api/users/upload-cover", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};