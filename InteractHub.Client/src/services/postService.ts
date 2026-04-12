import axiosInstance from "./axiosInstance";

// ── 1. Interface BE (PascalCase - Khớp với C# PostResponseDto) ──
interface PostResponseDto {
  Id: number;
  Title?: string;
  Content?: string;
  UserId?: string;
  Status?: number;
  AuthorName?: string;   // ✅ Khớp với MapToDto: AuthorName
  AuthorAvatar?: string; // ✅ Khớp với MapToDto: AuthorAvatar
  CreatedAt?: string;
  MediaUrls: string[];
}

// ── 2. Interface FE (camelCase - Dùng trong các Component React) ──
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

// ── 3. Map BE → FE ──────────────────────────────────────────────
const mapPost = (p: PostResponseDto): PostItem => ({
  id: p.Id,
  title: p.Title,
  content: p.Content,
  userId: p.UserId,
  status: p.Status,
  authorName: p.AuthorName,   // ✅ Sửa từ p.UserName
  authorAvatar: p.AuthorAvatar, // ✅ Sửa từ p.AvatarUrl
  createdAt: p.CreatedAt,
  mediaUrls: p.MediaUrls || [],
});

// ── 4. Export Service ───────────────────────────────────────────
export const postService = {
  createPost: (formData: FormData) =>
    axiosInstance
      .post<PostResponseDto>("/api/post/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => ({ ...res, data: mapPost(res.data) })),

  getAllPosts: () =>
    axiosInstance
      .get<PostResponseDto[]>("/api/post/all")
      .then((res) => ({ ...res, data: res.data.map(mapPost) })),

  getPostsByUserId: (userId: string) =>
    axiosInstance
      .get<PostResponseDto[]>(`/api/post/user/${userId}`)
      .then((res) => ({ ...res, data: res.data.map(mapPost) })),

  getPostById: (postId: number) =>
    axiosInstance
      .get<PostResponseDto>(`/api/post/${postId}`)
      .then((res) => ({ ...res, data: mapPost(res.data) })),

  deletePost: (postId: number) =>
    axiosInstance.delete<{ message: string }>(`/api/post/delete/${postId}`),
  updatePost: (postId: number, formData: FormData) =>
    axiosInstance
      .put<PostResponseDto>(`/api/post/update/${postId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => ({ ...res, data: mapPost(res.data) })),
};