import axiosInstance from "./axiosInstance";

type ApiRes<T> = { Success: boolean; Message: string; Data: T };

export interface CommentResponse {
    Id: number;
    Content: string;
    UserId: string;
    UserName: string;
    UserAvatar?: string;
    PostId: number;
    ParentId?: number;
    CreatedAt: string;
    ParentUserName: string;
    LikeCount: number;
    IsLikedByCurrentUser: boolean;
    Replies: CommentResponse[];
}

export interface CommentLikeResponse {
    CommentId: number;
    UserId: string;
    LikeCount: number;
    IsLiked: boolean;
    CreatedAt: string;
}

export interface CreateCommentRequest {
    PostId: number;
    Content: string;
    ParentId?: number | null;
}

export const commentService = {
    create: async (request: CreateCommentRequest) => {
        const res = await axiosInstance.post<ApiRes<CommentResponse>>(
            "/api/comments",
            request
        );
        return res.data.Data;
    },

    update: async (commentId: number, content: string) => {
        const res = await axiosInstance.put<ApiRes<CommentResponse>>(
            `/api/comments/${commentId}`,
            { content }
        );
        return res.data.Data;
    },

    delete: async (commentId: number) => {
        const res = await axiosInstance.delete<ApiRes<null>>(
            `/api/comments/${commentId}`
        );
        return res.data.Data;
    },

    getByPost: async (postId: number) => {
        const res = await axiosInstance.get<ApiRes<CommentResponse[]>>(
            `/api/comments/post/${postId}`
        );
        return res.data.Data;
    },

    toggleLike: async (commentId: number) => {
        const res = await axiosInstance.post<ApiRes<CommentLikeResponse>>(
            `/api/comments/${commentId}/like`
        );
        return res.data.Data;
    },
};