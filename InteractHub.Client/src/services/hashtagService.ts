import axiosInstance from "./axiosInstance";

// ── Interface chuẩn camelCase (Khớp trực tiếp với JSON từ BE) ──
export interface HashtagItem {
  id: number;
  tag: string;
}

export const hashtagService = {
  // ── GET api/hashtags ──────────────────────────────────────
  // Lấy toàn bộ danh sách hashtag
  getAllHashtags: () =>
    axiosInstance.get<HashtagItem[]>("/api/hashtags"),

  // ── GET api/hashtags/search?tag=#abc ──────────────────────
  // Tìm kiếm hashtag cụ thể
  getByTag: (tag: string) =>
    axiosInstance.get<HashtagItem>(`/api/hashtags/search`, { params: { tag } }),
};