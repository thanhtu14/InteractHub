import axiosInstance from "./axiosInstance";

// ── Interface BE (PascalCase - khớp C# DTO) ──────────────────
interface NotificationResponseDto {
  Id: number;
  Message: string;
  Type: string;
  Link?: string;
  IsRead: boolean;
  CreatedAt: string;
}

// ── Interface FE (camelCase - dùng trong component) ───────────
export interface NotificationItem {
  id: number;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// ── Map BE → FE ───────────────────────────────────────────────
const mapNotification = (n: NotificationResponseDto): NotificationItem => ({
  id: n.Id,
  message: n.Message,
  type: n.Type,
  link: n.Link,
  isRead: n.IsRead,
  createdAt: n.CreatedAt,
});

export const notificationService = {
  // ── GET api/notifications ─────────────────────────────────
  getMyNotifications: () =>
    axiosInstance
      .get<NotificationResponseDto[]>("/api/notifications")
      .then((res) => ({ ...res, data: res.data.map(mapNotification) })),

  // ── GET api/notifications/unread-count ───────────────────
  getUnreadCount: () =>
    axiosInstance.get<{ unreadCount: number }>("/api/notifications/unread-count"),

  // ── PUT api/notifications/{id}/read ──────────────────────
  markAsRead: (id: number) =>
    axiosInstance.put<{ message: string }>(`/api/notifications/${id}/read`),

  // ── PUT api/notifications/read-all ───────────────────────
  markAllAsRead: () =>
    axiosInstance.put<{ message: string }>("/api/notifications/read-all"),

  // ── DELETE api/notifications/{id} ────────────────────────
  deleteNotification: (id: number) =>
    axiosInstance.delete<{ message: string }>(`/api/notifications/${id}`),
};