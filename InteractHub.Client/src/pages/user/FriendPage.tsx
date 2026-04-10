import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navigation";
import FriendRequestList from "../../components/FriendRequestList";

interface User {
  id: string | number;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

const FriendPage: React.FC = () => {
  const navigate = useNavigate();

  // 1. TỐI ƯU: Lấy user ngay khi khởi tạo State
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

  // 2. Chỉ dùng useEffect để kiểm tra quyền truy cập (Auth Guard)
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#18191a]">
      <Navbar />
      
      {/* Wrapper để căn chỉnh nội dung giống Facebook */}
      <main className="max-w-[1200px] mx-auto pt-20 px-4">
        <h1 className="text-2xl font-bold text-white mb-6">Lời mời kết bạn</h1>
        <FriendRequestList />
      </main>
    </div>
  );
};

export default FriendPage;