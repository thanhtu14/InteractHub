import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FriendRequestList from "../../components/FriendRequestList";
import FriendList from "../../components/ListFriends";
import { useAuth } from "../../context/useAuth";

const FriendPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#18191a]">

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
            {user && <FriendList userId={user.Id} />}
          </div>

        </div>
      </main>
    </div>
  );
};

export default FriendPage;