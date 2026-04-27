import axiosInstance from "./axiosInstance";

// ── Interfaces BE (PascalCase) ───────────────────────────────────
interface BeMessageMedia {
  MediaType: number;
  MediaUrl: string;
  FileName?: string;
  FileSize?: number;
}

interface BeMessage {
  Id: number;
  ConversationId: number;
  SenderId: string;
  SenderName: string;
  SenderAvatar?: string;
  Content?: string;
  MessageType: number;
  IsRead: boolean;
  IsDeleted: boolean;
  CreatedAt: string;
  Medias: BeMessageMedia[];
}

interface BeConversation {
  Id: number;
  OtherUserId: string;
  OtherUserName: string;
  OtherUserAvatar?: string;
  LastMessage?: string;
  LastMessageAt?: string;
  UnreadCount: number;
}

// ── Interfaces FE (camelCase) ────────────────────────────────────
export interface MessageMedia {
  mediaType: number;
  mediaUrl: string;
  fileName?: string;
  fileSize?: number;
}

export interface MessageItem {
  id: number;
  conversationId: number;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content?: string;
  messageType: number;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  medias: MessageMedia[];
}

export interface ConversationItem {
  id: number;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface PagedMessageResponse {
  messages: MessageItem[];
  hasMore: boolean;
}

// ── Mappers ──────────────────────────────────────────────────────
const mapMessage = (m: BeMessage): MessageItem => ({
  id: m.Id,
  conversationId: m.ConversationId,
  senderId: m.SenderId,
  senderName: m.SenderName,
  senderAvatar: m.SenderAvatar,
  content: m.Content,
  messageType: m.MessageType,
  isRead: m.IsRead,
  isDeleted: m.IsDeleted,
  createdAt: m.CreatedAt,
  medias: (m.Medias ?? []).map((media: BeMessageMedia) => ({
    mediaType: media.MediaType,
    mediaUrl: media.MediaUrl,
    fileName: media.FileName,
    fileSize: media.FileSize,
  })),
});

const mapConversation = (c: BeConversation): ConversationItem => ({
  id: c.Id,
  otherUserId: c.OtherUserId,
  otherUserName: c.OtherUserName,
  otherUserAvatar: c.OtherUserAvatar,
  lastMessage: c.LastMessage,
  lastMessageAt: c.LastMessageAt,
  unreadCount: c.UnreadCount,
});

// ── Service ──────────────────────────────────────────────────────
export const messageService = {
  getOrCreateConversation: (targetUserId: string) =>
    axiosInstance
      .post<{ Success: boolean; Data: BeConversation }>("/api/messages/conversation", {
        TargetUserId: targetUserId,
      })
      .then((res) => ({ ...res, data: mapConversation(res.data.Data) })),

  getConversations: () =>
    axiosInstance
      .get<{ Success: boolean; Data: BeConversation[] }>("/api/messages/conversations")
      .then((res) => ({ ...res, data: res.data.Data.map(mapConversation) })),

  getMessages: (conversationId: number, page: number = 1, pageSize: number = 20) =>
    axiosInstance
      .get<{ Success: boolean; Data: BeMessage[] }>(
        `/api/messages/${conversationId}?page=${page}&pageSize=${pageSize}`
      )
      .then((res) => ({
        ...res,
        data: {
          messages: res.data.Data.map(mapMessage),
          hasMore: res.data.Data.length === pageSize,
        } as PagedMessageResponse,
      })),

  sendMessage: (conversationId: number, content?: string, mediaFile?: File) => {
    const formData = new FormData();
    formData.append("ConversationId", String(conversationId));
    if (content) formData.append("Content", content);
    if (mediaFile) formData.append("MediaFile", mediaFile);

    return axiosInstance
      .post<{ Success: boolean; Data: BeMessage }>("/api/messages/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => ({ ...res, data: mapMessage(res.data.Data) }));
  },

  markAsRead: (conversationId: number) =>
    axiosInstance.put(`/api/messages/${conversationId}/read`),

  deleteMessage: (messageId: number) =>
    axiosInstance.delete(`/api/messages/${messageId}`),
};