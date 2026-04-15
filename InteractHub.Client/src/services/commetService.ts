import axiosInstance from "./axiosInstance";

// ── ApiResponse (PascalCase khớp C#) ──────────────────────
export interface ApiResponse<T> {
    Success: boolean;
    Message: string;
    Data: T;
}

// ── Interfaces cho Comment (PascalCase) ───────────────────
export interface CommentResponse {
    Id: number;
    Content: string;
    UserId: string;
    UserName: string;
    UserAvatar?: string;
    PostId: number;
    ParentId?: number;
    CreatedAt: string;
    ParentUserName: string,
    // Thêm 2 dòng này để khớp với logic mới của mình
    LikeCount: number;
    IsLikedByCurrentUser: boolean;
    Replies: CommentResponse[];
}

export interface CommentLikeResponse {
    CommentId: number;
    UserId: string;
    LikeCount: number; // Thêm dòng này
    IsLiked: boolean;  // Thêm dòng này để biết sau khi bấm là đang Like hay Unlike
    CreatedAt: string;
}

// ── Comment Service ────────────────────────────────────────

export const commentService = {
    // Tạo comment mới (Gửi object để BE bind DTO, nhận về PC)
    create: async (request: { PostId: number; Content: string; ParentId?: number | null }) => {
        const res = await axiosInstance.post<ApiResponse<CommentResponse>>(
            "/api/comments",
            request
        );
        return res.data;
    },

    // Cập nhật nội dung (Gửi object { content })
    update: async (commentId: number, content: string) => {
        const res = await axiosInstance.put<ApiResponse<CommentResponse>>(
            `/api/comments/${commentId}`,
            { content } // BE sẽ bind vào request.Content
        );
        return res.data;
    },

    // Xóa comment
    delete: async (commentId: number) => {
        const res = await axiosInstance.delete<ApiResponse<any>>(
            `/api/comments/${commentId}`
        );
        return res.data;
    },

    // Lấy tất cả comment của một bài viết
    getByPost: async (postId: number) => {
        const res = await axiosInstance.get<ApiResponse<CommentResponse[]>>(
            `/api/comments/post/${postId}`
        );
        return res.data;
    },

    // LIKE / UNLIKE COMMENT (Toggle)
    toggleLike: async (commentId: number) => {
        const res = await axiosInstance.post<ApiResponse<CommentLikeResponse | null>>(
            `/api/comments/${commentId}/like`
        );
        return res.data;
    },
    // Thêm hàm createReply
    createReply: async (request: {
        PostId: number;
        Content: string;
        ParentId: number
    }) => {
        const res = await axiosInstance.post<ApiResponse<CommentResponse>>(
            "/api/comments",
            request
        );
        return res.data;
    },
};