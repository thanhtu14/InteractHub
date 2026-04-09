import { z } from "zod";

// Định nghĩa các trạng thái của mối quan hệ
export const FriendshipStatus = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  BLOCKED: "Blocked",
  NONE: "None", // Trường hợp chưa có quan hệ gì
} as const;

export const friendshipSchema = z.object({
  id: z.string(),
  requesterId: z.string(),
  receiverId: z.string(),
  status: z.nativeEnum(FriendshipStatus),
  createdAt: z.string().datetime().optional(),
  
  // Thông tin người kia (tùy vào Backend trả về kèm theo)
  friendInfo: z.object({
    id: z.string(),
    username: z.string(),
    avatarUrl: z.string().nullable(),
  }).optional(),
});

export type Friendship = z.infer<typeof friendshipSchema>;
export type FriendshipStatusType = keyof typeof FriendshipStatus;