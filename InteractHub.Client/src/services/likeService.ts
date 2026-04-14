import axiosInstance from "./axiosInstance";

// 1. Interface chung cho API Response (Chuẩn PascalCase theo C#)
export interface ApiResponse<T> {
    Success: boolean;
    Message: string;
    Data: T;
}

// 2. Interface cho thông tin chi tiết User (Dùng trong Modal)
export interface LikeUserDetails {
    UserId: string;
    FullName: string;
    Avatar: string;
    Type: string;
}

// 3. Interface cho trạng thái Like của một bài viết
export interface LikeStateDto {
    Total: number;
    UserReaction: string | null;
    Breakdown: Record<string, number>;
}

/** * ĐỊNH NGHĨA LẠI LikeSummary ĐỂ FIX LỖI IMPORT
 * Đây thực chất là bí danh (alias) của LikeStateDto
 */
export type LikeSummary = LikeStateDto;

// 4. Các hàm xử lý Logic Like/Reaction
export const likeService = {
    // Gửi hoặc thay đổi cảm xúc
    react: async (postId: number, type: string) => {
        const res = await axiosInstance.post<ApiResponse<any>>(
            "/api/likes/react", 
            { postId, type }
        );
        return res.data; 
    },

    // Lấy trạng thái tổng quát (Số lượng, người dùng hiện tại đã like chưa)
    getState: async (postId: number) => {
        const res = await axiosInstance.get<ApiResponse<LikeStateDto>>(
            `/api/likes/state/${postId}`
        );
        return res.data;
    },

    // Lấy danh sách chi tiết những người đã thả cảm xúc (có lọc theo tab)
    getDetails: async (postId: number, type?: string) => {
        const res = await axiosInstance.get<ApiResponse<LikeUserDetails[]>>(
            `/api/likes/details/${postId}`, 
            {
                params: { type: !type || type === "all" ? null : type }
            }
        );
        return res.data;
    },
};