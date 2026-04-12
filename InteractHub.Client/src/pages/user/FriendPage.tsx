import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navigation";
import FriendRequestList from "../../components/FriendRequestList";
import FriendList from "../../components/ListFriends";

interface User {
  id: string | number;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

const FriendPage: React.FC = () => {
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!user) navigate("/");
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#18191a]">
      <Navbar />

      <main className="max-w-[1200px] mx-auto pt-20 px-4">
        <div className="flex gap-4 items-start">

          {/* ── CỘT TRÁI: Lời mời kết bạn ── */}
          <div className="w-[360px] flex-shrink-0">
            <h2 className="text-xl font-bold text-white mb-4">
              Lời mời kết bạn
            </h2>
            <FriendRequestList />
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-[#3e4042]" />

          {/* ── CỘT PHẢI: Danh sách bạn bè ── */}
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-4">
              Bạn bè
            </h2>
            <FriendList />
          </div>

        </div>
      </main>
    </div>
  );
};

export default FriendPage;