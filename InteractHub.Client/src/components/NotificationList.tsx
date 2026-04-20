import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import {
  notificationService,
  type NotificationItem,
} from "../services/notificationService";

// ✅ Cập nhật hàm formatTime chuẩn xác như bên Comment
const formatTime = (dateString?: string | null): string => {
  if (!dateString) return "";

  // Chuẩn hóa format: Thay khoảng trắng bằng 'T' và thêm 'Z' (UTC)
  const normalizedDate = dateString.replace(" ", "T") + "Z";
  const now = new Date();
  const past = new Date(normalizedDate);

  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ trước`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Hôm qua";
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  return `${Math.floor(diffInDays / 7)} tuần trước`;
};

const getTypeIcon = (type: string): string => {
  switch (type.toUpperCase()) {
    case "FRIEND_REQUEST": return "👤";
    case "POST_LIKE": 
    case "LIKE":           return "❤️";
    case "COMMENT":        return "💬";
    case "SHARE":          return "🔁";
    case "SYSTEM":         return "🔔";
    default:               return "🔔";
  }
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();

  useEffect(() => {
    notificationService
      .getMyNotifications()
      .then((res) => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch((err) => {
        console.error("Lỗi khi tải thông báo:", err);
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    notificationService.markAllAsRead().then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });
  };

const markAsRead = async (id: number, link?: string) => {
  const target = notifications.find((n) => n.id === id);
  if (!target) return;

  // Hàm hỗ trợ điều hướng thông minh
  const navigateTo = (url: string) => {
    const currentFullUrl = window.location.pathname + window.location.search + window.location.hash;
    
    // Nếu link đích giống hệt link hiện tại, ép tải lại trang để kích hoạt useEffect/Scroll
    if (url === currentFullUrl || window.location.href.endsWith(url)) {
      window.location.reload();
    } else {
      // Dùng assign để tránh lỗi "cannot be modified" và hỗ trợ điều hướng
      window.location.assign(url);
    }
  };

  // 1. Nếu thông báo đã đọc rồi, chỉ việc đi tới link
  if (target.isRead) {
    if (link) navigateTo(link);
    return;
  }

  // 2. Nếu chưa đọc, gọi API đánh dấu và đi tới link
  try {
    await notificationService.markAsRead(id);
    
    // Cập nhật UI local
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    if (link) navigateTo(link);
  } catch (error) {
    console.error("Lỗi khi đánh dấu đã đọc:", error);
    // Kể cả lỗi API vẫn cho người dùng đi tới nội dung
    if (link) navigateTo(link);
  }
};

  const renderNotifyMessage = (notif: NotificationItem) => {
    const { lastActorName, actorsCount, message } = notif;
    
    if (actorsCount > 1) {
      return (
        <span>
          <strong className="text-white font-semibold">{lastActorName}</strong> và{" "}
          <strong className="text-white font-semibold">{actorsCount - 1} người khác</strong> {message}
        </span>
      );
    }

    return (
      <span>
        <strong className="text-white font-semibold">{lastActorName}</strong> {message}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#18191a]">
      {/* HEADER */}
      <div className="sticky top-0 z-10 flex-shrink-0 bg-[#18191a]
                      flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <h2 className="text-[17px] font-bold text-gray-200 uppercase tracking-wider">
            Thông báo
          </h2>
          {unreadCount > 0 && !loading && (
            <span className="bg-red-500 text-white text-[11px] font-bold
                             px-1.5 py-0.5 rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && !loading && (
          <button
            onClick={markAllAsRead}
            className="text-[13px] text-blue-400 hover:text-blue-300
                       font-medium transition-colors cursor-pointer"
          >
            Đọc tất cả
          </button>
        )}
      </div>

      {/* DANH SÁCH */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 py-2">
        {loading && (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2
                            border-blue-600 border-t-transparent" />
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="py-10 text-center px-4">
            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full
                            flex items-center justify-center mb-4 text-2xl">
              🔔
            </div>
            <p className="text-gray-400 text-sm">Bạn chưa có thông báo nào</p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="space-y-1">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id, notif.link)}
                className={`flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer
                            transition-all group relative
                            ${notif.isRead
                              ? "hover:bg-[#3a3b3c]"
                              : "bg-[#263248] hover:bg-[#2d3a52] border-l-4 border-blue-500 rounded-l-none"
                            }`}
              >
                <div className="relative flex-shrink-0">
                  {notif.lastActorAvatar ? (
                    <img 
                      src={`https://localhost:7069${notif.lastActorAvatar}`}
                      alt={notif.lastActorName}
                      className="w-12 h-12 rounded-full object-cover border border-gray-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#3a3b3c] 
                                    flex items-center justify-center text-xl border border-gray-700">
                      {getTypeIcon(notif.type)}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#242526] 
                                  flex items-center justify-center text-[12px] border border-gray-800">
                    {getTypeIcon(notif.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[14px] text-gray-300 leading-snug">
                    {renderNotifyMessage(notif)}
                  </div>
                  <p className={`text-[12px] mt-1 ${
                    notif.isRead ? "text-gray-500" : "text-blue-400 font-semibold"
                  }`}>
                    {/* ✅ Gọi hàm format đã sửa */}
                    {formatTime(notif.createdAt)}
                  </p>
                </div>

                {!notif.isRead && (
                  <span className="flex-shrink-0 w-3 h-3 bg-blue-500
                                   rounded-full self-center" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList;