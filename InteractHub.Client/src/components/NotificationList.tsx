import { useEffect, useState } from "react";

interface NotificationType {
  id: string | number;
  senderName: string;
  senderAvatar?: string;
  type: "friend_request" | "like" | "comment" | "share" | "mention";
  message: string;
  time: string;
  isRead: boolean;
}

const TYPE_ICON: Record<NotificationType["type"], string> = {
  friend_request: "👤",
  like: "❤️",
  comment: "💬",
  share: "🔁",
  mention: "📢",
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);

  // --- PHẦN LOGIC BE (COMMENT KHI CHƯA CÓ BE) ---
  /*
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    fetch(`http://localhost:8080/api/notifications/${userId}`)
      .then((res) => { if (!res.ok) throw new Error("Failed"); return res.json(); })
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch((err) => { console.error("Lỗi khi tải thông báo:", err); setNotifications([]); })
      .finally(() => setLoading(false));
  }, [userId]);
  */

  // --- PHẦN MOCK DATA (XÓA KHI CÓ BE) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications([
        { id: 1, senderName: "Nguyễn Văn A",      senderAvatar: "https://i.pravatar.cc/150?u=1",    type: "friend_request", message: "đã gửi cho bạn lời mời kết bạn.",       time: "2 phút trước",  isRead: false },
        { id: 2, senderName: "Trần Thị B",         senderAvatar: "https://i.pravatar.cc/150?u=2",    type: "like",           message: "đã thích bài viết của bạn.",             time: "15 phút trước", isRead: false },
        { id: 3, senderName: "Lê Văn C",           senderAvatar: "https://i.pravatar.cc/150?u=3",    type: "comment",        message: "đã bình luận vào bài viết của bạn.",     time: "1 giờ trước",   isRead: false },
        { id: 4, senderName: "Phạm Minh D",        senderAvatar: "https://i.pravatar.cc/150?u=4",    type: "share",          message: "đã chia sẻ bài viết của bạn.",           time: "3 giờ trước",   isRead: true  },
        { id: 5, senderName: "Hoàng Thị E",        senderAvatar: "https://i.pravatar.cc/150?u=5",    type: "mention",        message: "đã nhắc đến bạn trong một bình luận.",   time: "Hôm qua",       isRead: true  },
        { id: 6, senderName: "Đặng Văn F",         senderAvatar: "https://i.pravatar.cc/150?u=6",    type: "like",           message: "đã thích ảnh của bạn.",                  time: "Hôm qua",       isRead: true  },
        { id: 7, senderName: "Bùi Gia Quang Vinh", senderAvatar: "https://i.pravatar.cc/150?u=vinh", type: "friend_request", message: "đã chấp nhận lời mời kết bạn của bạn.", time: "2 ngày trước",  isRead: true  },
        { id: 8, senderName: "Bùi Gia Quang Vinh", senderAvatar: "https://i.pravatar.cc/150?u=vinh", type: "friend_request", message: "đã chấp nhận lời mời kết bạn của bạn.", time: "2 ngày trước",  isRead: true  },
        { id: 9, senderName: "Bùi Gia Quang Vinh", senderAvatar: "https://i.pravatar.cc/150?u=vinh", type: "friend_request", message: "đã chấp nhận lời mời kết bạn của bạn.", time: "2 ngày trước",  isRead: true  },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

  const markAsRead = (id: string | number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

  return (
    /*
      Wrapper tự quản lý chiều cao + scroll.
      - "flex flex-col h-full" : xếp header và danh sách theo chiều dọc
      - KHÔNG overflow         : để sticky hoạt động với scrollable-div bên trong
    */
    <div className="flex flex-col h-full">

      {/* ── HEADER CỐ ĐỊNH ──
          sticky + z-10        : nổi lên trên danh sách khi scroll
          bg-backgroundCommentDark : che nội dung cuộn phía dưới
          flex-shrink-0        : không bị nén khi danh sách dài
      */}
      <div className="sticky top-0 z-10 flex-shrink-0
                      bg-[#18191a]
                      flex items-center justify-between
                      px-4 pt-4 pb-3">
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

      {/* ── PHẦN SCROLL ──
          flex-1         : chiếm phần còn lại sau header
          overflow-y-auto: scroll xảy ra ở ĐÂY, không phải ở wrapper ngoài
          → sticky của header sẽ cố định trên đầu vùng scroll này
      */}
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
                onClick={() => markAsRead(notif.id)}
                className={`flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer
                            transition-colors group relative
                            ${notif.isRead
                              ? "hover:bg-[#3a3b3c]"
                              : "bg-[#263248] hover:bg-[#2d3a52]"
                            }`}
              >
                {/* Avatar + icon loại */}
                <div className="relative flex-shrink-0">
                  <img
                    src={notif.senderAvatar || "/assets/img/icons8-user-default-64.png"}
                    alt={notif.senderName}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <span className="absolute -bottom-1 -right-1 text-[13px] leading-none
                                   bg-[#242526] rounded-full p-0.5">
                    {TYPE_ICON[notif.type]}
                  </span>
                </div>

                {/* Nội dung */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-gray-200 leading-snug">
                    <span className="font-semibold text-white group-hover:text-blue-400
                                     transition-colors">
                      {notif.senderName}
                    </span>{" "}
                    {notif.message}
                  </p>
                  <p className={`text-[12px] mt-0.5 ${
                    notif.isRead ? "text-gray-500" : "text-blue-400 font-medium"
                  }`}>
                    {notif.time}
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