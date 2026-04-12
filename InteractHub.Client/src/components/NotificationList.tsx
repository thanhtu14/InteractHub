import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  notificationService,
  type NotificationItem,
} from "../services/notificationService";

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "Hôm qua";
  return `${diffDays} ngày trước`;
};

const getTypeIcon = (type: string): string => {
  switch (type.toUpperCase()) {
    case "FRIEND_REQUEST": return "👤";
    case "LIKE":           return "❤️";
    case "COMMENT":        return "💬";
    case "SHARE":          return "🔁";
    case "MENTION":        return "📢";
    case "SYSTEM":         return "🔔";
    default:               return "🔔";
  }
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const markAsRead = (id: number, link?: string) => {
    if (notifications.find((n) => n.id === id)?.isRead) {
      if (link) navigate(link);
      return;
    }
    notificationService.markAsRead(id).then(() => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (link) navigate(link);
    });
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── HEADER CỐ ĐỊNH ── */}
      <div className="sticky top-0 z-10 flex-shrink-0 bg-[#18191a]
                      flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[17px] font-semibold text-gray-400 uppercase tracking-wider">
            Thông báo
          </h2>
          {unreadCount > 0 && !loading && (
            <span className="bg-blue-600 text-white text-[11px] font-bold
                             px-1.5 py-0.5 rounded-full leading-none">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && !loading && (
          <button
            onClick={markAllAsRead}
            className="text-[12px] text-blue-400 hover:text-blue-300
                       font-medium transition-colors cursor-pointer"
          >
            Đọc tất cả
          </button>
        )}
      </div>

      {/* ── PHẦN SCROLL ── */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-4">

        {/* Loading */}
        {loading && (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2
                            border-blue-600 border-t-transparent" />
          </div>
        )}

        {/* Empty */}
        {!loading && notifications.length === 0 && (
          <div className="py-10 text-center px-4">
            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full
                            flex items-center justify-center mb-4 text-2xl">
              🔔
            </div>
            <p className="text-gray-400 text-sm">Bạn chưa có thông báo nào</p>
          </div>
        )}

        {/* Danh sách */}
        {!loading && notifications.length > 0 && (
          <div className="space-y-1">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id, notif.link)}
                className={`flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer
                            transition-colors group relative
                            ${notif.isRead
                              ? "hover:bg-[#3a3b3c]"
                              : "bg-[#263248] hover:bg-[#2d3a52]"
                            }`}
              >
                {/* Icon loại thông báo */}
                <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#3a3b3c]
                                flex items-center justify-center text-xl">
                  {getTypeIcon(notif.type)}
                </div>

                {/* Nội dung */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-gray-200 leading-snug">
                    {notif.message}
                  </p>
                  <p className={`text-[12px] mt-0.5 ${
                    notif.isRead ? "text-gray-500" : "text-blue-400 font-medium"
                  }`}>
                    {formatTime(notif.createdAt)}
                  </p>
                </div>

                {/* Chấm chưa đọc */}
                {!notif.isRead && (
                  <span className="flex-shrink-0 w-2.5 h-2.5 bg-blue-500
                                   rounded-full mt-1.5" />
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