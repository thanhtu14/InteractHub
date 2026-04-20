// import React, { useState } from "react";
// import { FaChevronRight } from "react-icons/fa";
import PostingForm from "../../components/PostingForm";
import StoryList from "../../components/StoryList";
import FriendRequestList from "../../components/FriendRequestList";
import PostList from "../../components/ContainerPost";
import { useAuth } from "../../context/useAuth";

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const userForComponents = {
    id: user?.Id ?? "",
    fullName: user?.Username,
    avatarUrl: user?.AvatarUrl ?? undefined,
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* --- CỘT 1 (TRÁI) --- */}
      <aside className="hidden lg:flex flex-col h-full overflow-y-auto no-scrollbar bg-[#18191a] w-[390px] flex-shrink-0">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white px-4 mt-2 tracking-tight">
            Trang chủ
          </h2>
          <div className="px-2">
            <PostingForm />
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
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar bg-[#18191a] transition-all duration-300 ease-in-out">
        <div className="max-w-[850px] lg:max-w-[1000px] mx-auto py-5 space-y-6">
          <StoryList user={userForComponents} />
          <PostList />
          <div className="h-20" />
        </div>
      </main>

    </div>
  );
};

export default HomePage;