import axiosInstance from "./axiosInstance";

// ── 1. Interface BE (PascalCase - Khớp với C# PostResponseDto) ──
interface PostResponseDto {
  Id: number;
  Title?: string;
  Content?: string;
  UserId?: string;
  Status?: number;
  AuthorName?: string;
  AuthorAvatar?: string;
  CreatedAt?: string;
  MediaUrls: string[];
}
// ── 3. Interface FE (camelCase) ──────────────────────────────────
export interface PostItem {
  id: number;
  title?: string;
  content?: string;
  userId?: string;
  status?: number;
  authorName?: string;
  authorAvatar?: string;
  createdAt?: string;
  mediaUrls: string[];
}

export interface PostReportItem {
  id: number;
  postId: number;
  userId: string;
  userName: string;
  reason: string;
  status: number;
  createdAt: string;
}

export interface PostReportRequest {
  postId: number;
  reason: string;
}

// ── 4. Map BE → FE ──────────────────────────────────────────────
const mapPost = (p: PostResponseDto): PostItem => ({
  id: p.Id,
  title: p.Title,
  content: p.Content,
  userId: p.UserId,
  status: p.Status,
  authorName: p.AuthorName,
  authorAvatar: p.AuthorAvatar,
  createdAt: p.CreatedAt,
  mediaUrls: p.MediaUrls || [],
});



// ── 5. Export Service ───────────────────────────────────────────
export const postService = {
  createPost: (formData: FormData) =>
    axiosInstance
      .post<{ Success: boolean; Message: string; Data: PostResponseDto }>("/api/post/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => ({ ...res, data: mapPost(res.data.Data) })),

  getAllPosts: () =>
    axiosInstance
      .get<{ Success: boolean; Message: string; Data: PostResponseDto[] }>("/api/post/all")
      .then((res) => ({ ...res, data: res.data.Data.map(mapPost) })),


  getPostsByUserId: (userId: string) =>
    axiosInstance
      .get<{ Success: boolean; Message: string; Data: PostResponseDto[] }>(`/api/post/user/${userId}`)
      .then((res) => ({ ...res, data: res.data.Data.map(mapPost) })),

  getPostById: (postId: number) =>
    axiosInstance
      .get<{ Success: boolean; Message: string; Data: PostResponseDto }>(
        `/api/post/${postId}`
      )
      .then((res) => ({ ...res, data: mapPost(res.data.Data) })),

  deletePost: (postId: number) =>
    axiosInstance
      .delete<{ Success: boolean; Message: string }>(
        `/api/post/delete/${postId}`
      )
      .then((res) => ({
        success: res.data.Success,
        message: res.data.Message,
      })),

  updatePost: (postId: number, formData: FormData) =>
    axiosInstance
      .put<{ Success: boolean; Message: string; Data: PostResponseDto }>(`/api/post/update/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => ({ ...res, data: mapPost(res.data.Data) })),
  reportPost: (request: PostReportRequest) =>
    axiosInstance
      .post<{ Success: boolean; Message: string }>("/api/post-reports", request),
};