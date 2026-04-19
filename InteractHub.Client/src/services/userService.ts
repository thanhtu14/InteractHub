import axiosInstance from "./axiosInstance";
import { type User, type ProfileUpdateData } from "../schemas/user.schema";

type ApiRes<T> = { Success: boolean; Message: string; Data: T };

export const userService = {
  getProfileMe: () =>
    axiosInstance
      .get<ApiRes<User>>("/api/users/me")
      .then((res) => ({ ...res, data: res.data.Data })),

  getUserById: (id: string) =>
    axiosInstance
      .get<ApiRes<User>>(`/api/users/${id}`)
      .then((res) => ({ ...res, data: res.data.Data })),

  getProfile: (id?: string) =>
    id ? userService.getUserById(id) : userService.getProfileMe(),

  updateProfile: (data: ProfileUpdateData) =>
    axiosInstance
      .put<ApiRes<User>>("/api/users/update", data)
      .then((res) => ({ ...res, data: res.data.Data })),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance
      .post<ApiRes<string>>("/api/users/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => ({ ...res, data: res.data.Data }));
  },

  uploadCover: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance
      .post<ApiRes<string>>("/api/users/upload-cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => ({ ...res, data: res.data.Data }));
  },
};