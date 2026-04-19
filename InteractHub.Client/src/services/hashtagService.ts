import axiosInstance from "./axiosInstance";

interface ApiResponse<T> {
  Success: boolean;
  Message: string;
  Data: T;
}

export interface HashtagItem {
  Id: number;
  Tag: string;
}

export const hashtagService = {
  getAllHashtags: () =>
    axiosInstance
      .get<ApiResponse<HashtagItem[]>>("/api/hashtags")
      .then((res) => ({ ...res, data: res.data.Data })),

  getByTag: (tag: string) =>
    axiosInstance
      .get<ApiResponse<HashtagItem>>("/api/hashtags/search", { params: { tag } })
      .then((res) => ({ ...res, data: res.data.Data })),
};