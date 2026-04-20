// import axiosInstance from "./axiosInstance";

// type ApiRes<T> = { Success: boolean; Message: string; Data: T };

// interface NotificationResponseDto {
//   Id: number;
//   Message: string;
//   Type: string;
//   Link?: string;
//   IsRead: boolean;
//   CreatedAt: string;
// }

// export interface NotificationItem {
//   id: number;
//   message: string;
//   type: string;
//   link?: string;
//   isRead: boolean;
//   createdAt: string;
// }

// const mapNotification = (n: NotificationResponseDto): NotificationItem => ({
//   id: n.Id,
//   message: n.Message,
//   type: n.Type,
//   link: n.Link,
//   isRead: n.IsRead,
//   createdAt: n.CreatedAt,
// });

// export const notificationService = {
//   getMyNotifications: () =>
//     axiosInstance
//       .get<ApiRes<NotificationResponseDto[]>>("/api/notifications")
//       .then((res) => ({ ...res, data: res.data.Data.map(mapNotification) })),

//   getUnreadCount: () =>
//     axiosInstance
//       .get<ApiRes<number>>("/api/notifications/unread-count")
//       .then((res) => ({ ...res, data: res.data.Data })),

//   markAsRead: (id: number) =>
//     axiosInstance
//       .put<ApiRes<null>>(`/api/notifications/${id}/read`),

//   markAllAsRead: () =>
//     axiosInstance
//       .put<ApiRes<null>>("/api/notifications/read-all"),

//   deleteNotification: (id: number) =>
//     axiosInstance
//       .delete<ApiRes<null>>(`/api/notifications/${id}`),
// };
import axiosInstance from "./axiosInstance";

type ApiRes<T> = { Success: boolean; Message: string; Data: T };

// 1. Cập nhật DTO khớp với Backend (PascalCase từ C# trả về)
interface NotificationResponseDto {
  Id: number;
  Message: string;
  Type: string;
  Link?: string;
  IsRead: boolean;
  CreatedAt: string;
  // Các trường mới cho logic gom nhóm
  LastActorName?: string;
  LastActorAvatar?: string;
  ActorsCount: number;
}

// 2. Cập nhật Interface cho Frontend sử dụng (camelCase)
export interface NotificationItem {
  id: number;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  lastActorName: string;
  lastActorAvatar?: string;
  actorsCount: number;
}

// 3. Map dữ liệu từ API sang Object của React
const mapNotification = (n: NotificationResponseDto): NotificationItem => ({
  id: n.Id,
  message: n.Message,
  type: n.Type,
  link: n.Link,
  isRead: n.IsRead,
  createdAt: n.CreatedAt,
  lastActorName: n.LastActorName ?? "Ai đó",
  lastActorAvatar: n.LastActorAvatar,
  actorsCount: n.ActorsCount || 1,
});

export const notificationService = {
  getMyNotifications: () =>
    axiosInstance
      .get<ApiRes<NotificationResponseDto[]>>("/api/notifications")
      .then((res) => ({ ...res, data: res.data.Data.map(mapNotification) })),

  getUnreadCount: () =>
    axiosInstance
      .get<ApiRes<number>>("/api/notifications/unread-count")
      .then((res) => ({ ...res, data: res.data.Data })),

  markAsRead: (id: number) =>
    axiosInstance.put<ApiRes<null>>(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    axiosInstance.put<ApiRes<null>>("/api/notifications/read-all"),

  deleteNotification: (id: number) =>
    axiosInstance.delete<ApiRes<null>>(`/api/notifications/${id}`),
};