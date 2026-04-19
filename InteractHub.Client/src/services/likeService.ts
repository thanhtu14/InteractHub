import axiosInstance from "./axiosInstance";

type ApiRes<T> = { Success: boolean; Message: string; Data: T };

export interface LikeUserDetails {
    UserId: string;
    FullName: string;
    Avatar: string;
    Type: string;
}

export interface LikeStateDto {
    Total: number;
    UserReaction: string | null;
    Breakdown: Record<string, number>;
}

export type LikeSummary = LikeStateDto;

export interface LikeReactDto {
    CommentId?: number;
    LikeCount?: number;
    IsLiked?: boolean;
    Id?: number;
    UserId?: string;
    PostId?: number;
    Type?: string;
    CreatedAt?: string;
}

export const likeService = {
    react: async (postId: number, type: string) => {
        const res = await axiosInstance.post<ApiRes<LikeReactDto>>(
            "/api/likes/react",
            { postId, type }
        );
        return res.data.Data;
    },

    getState: async (postId: number) => {
        const res = await axiosInstance.get<ApiRes<LikeStateDto>>(
            `/api/likes/state/${postId}`
        );
        return res.data.Data;
    },

    getDetails: async (postId: number, type?: string) => {
        const res = await axiosInstance.get<ApiRes<LikeUserDetails[]>>(
            `/api/likes/details/${postId}`,
            {
                params: { type: !type || type === "all" ? null : type }
            }
        );
        return res.data.Data;
    },
};