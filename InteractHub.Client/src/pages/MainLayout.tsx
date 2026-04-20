import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import Navbar from "../components/Navigation";
import FriendList from "../components/ListFriends";
import NotificationList from "../components/NotificationList";
import { useAuth } from "../context/useAuth";

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [rightSidebarView, setRightSidebarView] = useState<"friends" | "notifications" | "closed">("friends");

  const handleChatClick = () =>
    setRightSidebarView((prev) => prev === "friends" ? "closed" : "friends");

  const handleNotifyClick = () =>
    setRightSidebarView((prev) => prev === "notifications" ? "closed" : "notifications");

  const isOpen = rightSidebarView !== "closed";

  return (
    <div className="h-screen bg-[#18191a] overflow-hidden flex flex-col">
      <Navbar
        onChatClick={handleChatClick}
        onNotifyClick={handleNotifyClick}
      />

      <div className="flex flex-1 overflow-hidden">

        {/* ── NỘI DUNG TRANG (Outlet) ── */}
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
                    {user && <FriendList userId={user.Id} />}
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
    </div>
  );
};

export default MainLayout;