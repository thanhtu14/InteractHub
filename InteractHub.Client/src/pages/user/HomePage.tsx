import React, { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import Navbar from "../../components/Navigation";
import PostingForm from "../../components/PostingForm";
import StoryList from "../../components/StoryList";
import FriendList from "../../components/ListFriends";
import NotificationList from "../../components/NotificationList";
import FriendRequestList from "../../components/FriendRequestList";
import PostList from "../../components/ContainerPost";

interface User {
  id: string | number;
  fullName?: string;
  avatarUrl?: string;
}

const HomePage: React.FC = () => {
  const [user] = useState<User | null>(() => {
      const storedUser = localStorage.getItem("interact_hub_user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser) as User;
        } catch (err) {
          console.error("Lỗi khi parse user từ localStorage", err);
          localStorage.removeItem("user");
          return null;
        }
      }
      return null;
    });
  

  const [rightSidebarView, setRightSidebarView] = useState<
    "friends" | "notifications" | "closed"
  >("friends");

  const handleChatClick = () => {
    setRightSidebarView((prev) =>
      prev === "friends" ? "closed" : "friends"
    );
  };

  const handleNotifyClick = () => {
    setRightSidebarView((prev) =>
      prev === "notifications" ? "closed" : "notifications"
    );
  };

  const isOpen = rightSidebarView !== "closed";

  return (
    <div className="h-screen bg-[#18191a] overflow-hidden flex flex-col">

      <Navbar
       
        onChatClick={handleChatClick}
        onNotifyClick={handleNotifyClick}
      />

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 overflow-hidden">

        {/* --- CỘT 1 (TRÁI) --- */}
        <aside
          className={`
            hidden lg:flex flex-col h-full overflow-y-auto no-scrollbar bg-[#18191a]
            transition-all duration-300 ease-in-out
            ${isOpen ? "w-[360px]" : "flex-1 max-w-[420px]"}
          `}
        >
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white px-4 mt-2 tracking-tight">
              Trang chủ
            </h2>
            <div className="px-2">
              <PostingForm user={user} />
            </div>
            <div className="mt-6 px-4 space-y-2">
              <p className="text-gray-500 text-[13px] font-bold uppercase tracking-wider mb-3">
                Lời mời kết bạn
              </p>
              <FriendRequestList />
            </div>
          </div>
        </aside>

        {/* --- CỘT 2 (GIỮA) --- */}
        <main
          className="flex-1 h-full overflow-y-auto custom-scrollbar bg-[#18191a]
                     transition-all duration-300 ease-in-out"
        >
          <div className="max-w-[850px] lg:max-w-[1000px] mx-auto py-5 space-y-6">
            <StoryList user={user} />
            <PostList />
            <div className="h-20" />
          </div>
        </main>

        {/* --- CỘT 3 (PHẢI) --- */}
        <aside
          className={`
            hidden xl:flex flex-col h-full bg-[#18191a] border-l border-gray-800/30
            transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0
            ${isOpen ? "w-[340px]" : "w-12"}
          `}
        >
          {isOpen ? (
            /* ── TRẠNG THÁI MỞ ── */
            <div className="flex flex-col h-full w-[340px]">
              <div className="flex justify-start px-3 pt-3 flex-shrink-0">
                <button
                  onClick={() => setRightSidebarView("closed")}
                  className="p-2 rounded-xl hover:bg-[#3a3b3c] text-gray-400
                             hover:text-white transition-colors"
                  title="Đóng cột"
                >
                  <FaChevronRight size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-2">
                {rightSidebarView === "friends" ? (
                  <div
                    key="friends-list"
                    className="animate-in fade-in slide-in-from-right-5 duration-500"
                  >
                    <FriendList />
                  </div>
                ) : (
                  <div
                    key="notify-list"
                    className="animate-in fade-in slide-in-from-right-5 duration-500"
                  >
                    <NotificationList />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── TRẠNG THÁI ĐÓNG ── */
            <div className="flex flex-col items-center pt-3">
              <button
                onClick={() => setRightSidebarView("friends")}
                className="p-2 rounded-xl hover:bg-[#3a3b3c] text-gray-400
                           hover:text-white transition-colors"
                title="Mở cột"
              >
                <FaChevronRight size={14} className="rotate-180" />
              </button>
            </div>
          )}
        </aside>

      </div>
    </div>
  );
};

export default HomePage;