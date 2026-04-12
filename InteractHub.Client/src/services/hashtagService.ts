import axiosInstance from "./axiosInstance";

// ── Interface BE (Khớp với HashtagResponseDto trong C#) ──────
interface HashtagResponseDto {
  Id: number;
  Tag: string;
}

// ── Interface FE (Dùng để hiển thị trong React) ──────────────
export interface HashtagItem {
  id: number;
  tag: string;
}

// ── Map BE → FE ───────────────────────────────────────────────
const mapHashtag = (h: HashtagResponseDto): HashtagItem => ({
  id: h.Id,
  tag: h.Tag,
});

export const hashtagService = {
  // ── GET api/hashtags ──────────────────────────────────────
  // Lấy toàn bộ danh sách hashtag
  getAllHashtags: () =>
    axiosInstance
      .get<HashtagResponseDto[]>("/api/hashtags")
      .then((res) => ({ 
        ...res, 
        data: res.data.map(mapHashtag) 
      })),

  // ── GET api/hashtags/search?tag=#abc ──────────────────────
  // Tìm kiếm hashtag cụ thể
  getByTag: (tag: string) =>
    axiosInstance
      .get<HashtagResponseDto>(`/api/hashtags/search`, { params: { tag } })
      .then((res) => ({ 
        ...res, 
        data: mapHashtag(res.data) 
      })),
};