import axiosInstance from "./axiosInstance";

type ApiRes<T> = { Success: boolean; Message: string; Data: T };

export interface StoryItem {
    Id: number;
    Content?: string;
    MediaUrl?: string;
    UserId?: string;
    FullName?: string;
    ProfilePicture?: string;
    CreatedAt?: string;
    ExpiredAt?: string;
}

export const storyService = {
    getAll: () =>
        axiosInstance
            .get<ApiRes<StoryItem[]>>("/api/story")
            .then((res) => ({ ...res, data: res.data.Data })),

    getById: (id: number) =>
        axiosInstance
            .get<ApiRes<StoryItem>>(`/api/story/${id}`)
            .then((res) => ({ ...res, data: res.data.Data })),

    create: (formData: FormData) =>
        axiosInstance
            .post<ApiRes<StoryItem>>("/api/story", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((res) => ({ ...res, data: res.data.Data })),

    update: (id: number, data: { Content?: string; MediaUrl?: string }) =>
        axiosInstance
            .put<ApiRes<null>>(`/api/story/${id}`, data)
            .then((res) => ({ ...res, data: res.data })),

    delete: (id: number) =>
        axiosInstance
            .delete<ApiRes<null>>(`/api/story/${id}`)
            .then((res) => ({ ...res, data: res.data })),
};