import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { FaChevronRight, FaTimes } from "react-icons/fa";
import Navbar from "../components/Navigation";
import ConversationList from "../components/ConversationList";
import NotificationList from "../components/NotificationList";
import ChatWindow, { type Conversation } from "../components/ChatWindow";
import { useAuth } from "../context/useAuth";
import { resolveUrl } from "../utils/urlUtils";

// ── Draggable Avatar Bubble ───────────────────────────────────────
// Hiện khi ChatWindow đang ở trạng thái minimized
// Có thể kéo thả tự do, tồn tại độc lập với sidebar
const DraggableAvatarBubble: React.FC<{
  conversation: Conversation;
  unreadCount: number;
  onRestore: () => void;
  onClose: () => void;
}> = ({ conversation, unreadCount, onRestore, onClose }) => {
  const [pos, setPos] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 160 });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, origX: 0, origY: 0, moved: false });

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
    };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.moved = true;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 56, dragRef.current.origX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 56, dragRef.current.origY + dy)),
      });
    };
    const onUp = () => { dragRef.current.dragging = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const handleClick = () => {
    // Chỉ restore nếu không phải đang kéo
    if (!dragRef.current.moved) onRestore();
  };

  return (
    <div
      className="fixed z-[100] group"
      style={{ left: pos.x, top: pos.y }}
      onMouseDown={onMouseDown}
    >
      {/* Nút đóng — hiện khi hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute -top-1 -right-1 z-10 w-5 h-5 bg-[#3a3b3c] hover:bg-red-500
                   rounded-full flex items-center justify-center text-gray-300 hover:text-white
                   opacity-0 group-hover:opacity-100 transition-all shadow-md border border-[#4e4f50]"
      >
        <FaTimes size={7} />
      </button>

      {/* Avatar */}
      <div
        onClick={handleClick}
        className="cursor-pointer select-none"
        title={`Chat với ${conversation.name}`}
      >
        <img
          src={resolveUrl(conversation.avatar) || "/assets/img/icons8-user-default-64.png"}
          className="w-14 h-14 rounded-full object-cover border-2 border-[#1877f2] shadow-xl
                     group-hover:scale-110 transition-transform duration-200"
          alt={conversation.name}
          draggable={false}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/assets/img/icons8-user-default-64.png";
          }}
        />

        {/* Online dot */}
        {conversation.online && (
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#18191a]" />
        )}

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -left-1 min-w-[20px] h-5 bg-red-500 rounded-full
                           flex items-center justify-center text-white text-[10px] font-bold px-1
                           animate-bounce shadow-md">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* Tooltip tên */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1
                      bg-[#18191a] text-white text-xs rounded-lg shadow-lg whitespace-nowrap
                      opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none
                      border border-[#3e4042]">
        {conversation.name}
      </div>
    </div>
  );
};

// ── MAIN LAYOUT ───────────────────────────────────────────────────
const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [rightSidebarView, setRightSidebarView] = useState<"friends" | "notifications" | "closed">("friends");

  // ── selectedConv sống ở đây — không mất khi sidebar đóng ──────
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [unreadWhileMin, setUnreadWhileMin] = useState(0);

  const handleChatClick = () =>
    setRightSidebarView((prev) => (prev === "friends" ? "closed" : "friends"));

  const handleNotifyClick = () =>
    setRightSidebarView((prev) => (prev === "notifications" ? "closed" : "notifications"));

  const isOpen = rightSidebarView !== "closed";

  // Khi chọn conv mới → mở cửa sổ
  const handleSelectConv = (conv: Conversation | null) => {
    setSelectedConv(conv);
    setChatMinimized(false);
    setUnreadWhileMin(0);
  };

  // Đóng hẳn ChatWindow
  const handleCloseChat = () => {
    setSelectedConv(null);
    setChatMinimized(false);
    setUnreadWhileMin(0);
  };

  return (
    <div className="h-screen bg-[#18191a] overflow-hidden flex flex-col">
      <Navbar
        onChatClick={handleChatClick}
        onNotifyClick={handleNotifyClick}
      />

      <div className="flex flex-1 overflow-hidden">

        {/* ── NỘI DUNG TRANG ── */}
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar bg-[#18191a]">
          <Outlet />
        </main>

        {/* ── CỘT PHẢI ── */}
        <aside
          className={`
            hidden xl:flex flex-col h-full bg-[#18191a] border-l border-gray-800/30
            transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0
            ${isOpen ? "w-[340px]" : "w-12"}
          `}
        >
          {isOpen ? (
            <div className="flex flex-col h-full w-[340px]">
              <div className="flex justify-start px-3 pt-3 flex-shrink-0">
                <button
                  onClick={() => setRightSidebarView("closed")}
                  className="p-2 rounded-xl hover:bg-[#3a3b3c] text-gray-400 hover:text-white transition-colors"
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-2">
                {rightSidebarView === "friends" ? (
                  <div className="animate-in fade-in slide-in-from-right-5 duration-500">
                    {user && (
                      <ConversationList
                        userId={user.Id}
                        selectedConv={selectedConv}
                        onSelectConv={handleSelectConv}
                      />
                    )}
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-right-5 duration-500">
                    <NotificationList />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center pt-3">
              <button
                onClick={() => setRightSidebarView("friends")}
                className="p-2 rounded-xl hover:bg-[#3a3b3c] text-gray-400 hover:text-white transition-colors"
              >
                <FaChevronRight size={14} className="rotate-180" />
              </button>
            </div>
          )}
        </aside>
      </div>

      {/* ══════════════════════════════════════════════════════════
          ChatWindow & Avatar bubble — render ngoài sidebar,
          tồn tại độc lập, không bị unmount khi sidebar đóng
      ══════════════════════════════════════════════════════════ */}
      {selectedConv && !chatMinimized && (
        <ChatWindow
          conversation={selectedConv}
          onClose={handleCloseChat}
          onMinimize={() => {
            setChatMinimized(true);
            setUnreadWhileMin(0);
          }}
        />
      )}

      {selectedConv && chatMinimized && (
        <DraggableAvatarBubble
          conversation={selectedConv}
          unreadCount={unreadWhileMin}
          onRestore={() => {
            setChatMinimized(false);
            setUnreadWhileMin(0);
          }}
          onClose={handleCloseChat}
        />
      )}
    </div>
  );
};

export default MainLayout;