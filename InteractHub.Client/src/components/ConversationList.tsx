import React, { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { type Conversation } from "./ChatWindow";
import { messageService, type ConversationItem } from "../services/messageService";
import { resolveUrl } from "../utils/urlUtils";
import { getTimeAgo } from "../utils/timeUtils";
import { signalRService } from "../services/signalRService";

interface ConversationListProps {
  userId: string;
  selectedConv: Conversation | null;
  onSelectConv: (conv: Conversation | null) => void;
}

const mapToConversation = (c: ConversationItem): Conversation => ({
  id: String(c.id),
  name: c.otherUserName,
  avatar: c.otherUserAvatar || "",
  online: true,
  lastMessage: c.lastMessage,
  lastMessageAt: c.lastMessageAt,
  unreadCount: c.unreadCount,
});

const ConversationList: React.FC<ConversationListProps> = ({
  selectedConv,
  onSelectConv,
}) => {
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedConvRef = useRef<Conversation | null>(null);
  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

  // ── Load conversations ────────────────────────────────────────
  useEffect(() => {
    messageService
      .getConversations()
      .then((res) => setConversations(res.data.map(mapToConversation)))
      .catch((err) => console.error("Lỗi tải conversations:", err))
      .finally(() => setLoading(false));
  }, []);

  // ── Realtime ──────────────────────────────────────────────────
  useEffect(() => {
    signalRService.onReceiveMessage((newMsg) => {
      const convId = String(newMsg.conversationId);
      const isOpen = String(selectedConvRef.current?.id) === convId;
      setConversations((prev) =>
        prev.map((c) => {
          if (String(c.id) !== convId) return c;
          return {
            ...c,
            lastMessage: newMsg.content ?? "📎 Media",
            lastMessageAt: newMsg.createdAt,
            unreadCount: isOpen ? 0 : (c.unreadCount ?? 0) + 1,
          };
        })
      );
    }, "convList");
    return () => signalRService.offReceiveMessage("convList");
  }, []);

  const handleSelect = (conv: Conversation) => {
    onSelectConv(conv);
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
    );
    messageService.markAsRead(Number(conv.id)).catch(console.error);
  };

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#18191a]">
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <h2 className="text-white font-bold text-[17px] mb-3">Tin nhắn</h2>
        <div className="relative">
          <FaSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={13}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full bg-[#3a3b3c] text-white pl-9 pr-4 py-2 rounded-full text-sm outline-none focus:ring-1 focus:ring-[#1877f2]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1877f2] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-10">
            {search
              ? "Không tìm thấy cuộc trò chuyện"
              : "Chưa có cuộc trò chuyện nào"}
          </p>
        ) : (
          filtered.map((conv) => {
            const hasUnread = (conv.unreadCount ?? 0) > 0;
            return (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv)}
                className={`flex items-center gap-3 px-3 py-3 mx-2 rounded-xl cursor-pointer transition-colors
                  ${selectedConv?.id === conv.id ? "bg-[#3a3b3c]" : "hover:bg-[#3a3b3c]"}`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={resolveUrl(conv.avatar) || "/assets/img/icons8-user-default-64.png"}
                    className="w-12 h-12 rounded-full object-cover"
                    alt={conv.name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/assets/img/icons8-user-default-64.png";
                    }}
                  />
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#18191a]" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className={`text-[15px] truncate ${hasUnread ? "text-white font-bold" : "text-gray-200 font-medium"}`}>
                      {conv.name}
                    </p>
                    <span className={`text-[11px] flex-shrink-0 ml-2 ${hasUnread ? "text-[#1877f2] font-semibold" : "text-gray-500"}`}>
                      {getTimeAgo(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className={`text-[13px] truncate ${hasUnread ? "text-white font-semibold" : "text-gray-500"}`}>
                      {conv.lastMessage ?? "Nhấn để trò chuyện"}
                    </p>
                    {hasUnread && (
                      <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 bg-[#1877f2] rounded-full flex items-center justify-center text-white text-[11px] font-bold px-1">
                        {(conv.unreadCount ?? 0) > 99 ? "99+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;