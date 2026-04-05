import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navigation";
import ProfileHeader from "../components/ProfileHeader";
import ListFriendsByID from "../components/ListFriendsByID";
import PostList from "../components/ContainerPost";
import PostingForm from "../components/PostingForm";
import InfoContainer from "../components/InfoContainer";

interface User {
  id: string | number;
  fullName?: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
}

const Profilepage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  useEffect(() => {
    // 1. LẤY USER ĐANG ĐĂNG NHẬP (Từ LocalStorage)
    const storedUser = localStorage.getItem("user");
    
    // GIẢ LẬP: Nếu chưa có user trong localStorage, tự tạo một user giả để không bị văng ra Login
    const defaultUser = { 
      id: 1, 
      fullName: "Bùi Gia Quang Vinh", 
      avatarUrl: "https://i.pravatar.cc/150?u=vinh" 
    };
    
    const parsedUser = storedUser ? JSON.parse(storedUser) : defaultUser;
    setLoggedInUser(parsedUser);

    // 2. XỬ LÝ LẤY DỮ LIỆU TRANG CÁ NHÂN (Mock Data thay cho API)
    const targetUserId = paramId || parsedUser.id;

    // --- PHẦN COMMENT BE (BẬT LẠI KHI CÓ API) ---
    /*
    axios.get(`http://localhost:8080/auth/${targetUserId}`)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error("Lỗi API:", err);
        navigate("/");
      });
    */

    // --- PHẦN MOCK DATA (XÓA KHI CÓ BE) ---
    const mockData: User = {
      id: targetUserId,
      fullName: targetUserId == 1 ? "Bùi Gia Quang Vinh" : "Người Bạn Demo",
      avatarUrl: `https://i.pravatar.cc/150?u=${targetUserId}`,
      bio: "Sống là để sẻ chia và học hỏi kiến thức mới mỗi ngày. 🚀",
    };
    
    // Giả lập độ trễ mạng 500ms cho chuyên nghiệp
    const timer = setTimeout(() => setUser(mockData), 500);
    return () => clearTimeout(timer);

  }, [navigate, paramId]);

  if (!user || !loggedInUser) {
    return (
      <div className="min-h-screen bg-[#18191a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#1877f2] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18191a] text-white">
      {/* Navbar luôn ở trên cùng */}
      <Navbar user={loggedInUser} />

      {/* Phần đầu trang: Ảnh bìa & Avatar */}
      <div className="bg-[#242526] shadow-md">
        <ProfileHeader userId={user.id} />
      </div>

      {/* Bố cục chính: Chia 2 cột */}
      <div className="max-w-[1100px] mx-auto mt-4 px-4 pb-10">
        <div className="flex flex-col lg:flex-row gap-5">
          
          {/* CỘT TRÁI (35%): Intro & Friends */}
          <div className="w-full lg:w-[40%] space-y-4">
            {/* Khối giới thiệu - Sticky để khi cuộn Post vẫn thấy Info */}
            <div className="sticky top-20 space-y-4">
              <div className="bg-[#242526] p-4 rounded-xl border border-gray-800 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Giới thiệu</h3>
                <InfoContainer userId={user.id} />
              </div>

              <div className="bg-[#242526] p-4 rounded-xl border border-gray-700 shadow-sm">
                <ListFriendsByID userId={user.id} />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (65%): Post & Form */}
          <div className="w-full lg:w-[60%] space-y-4">
            {/* Chỉ hiện Form đăng bài nếu là trang của chính mình */}
            {Number(loggedInUser.id) === Number(user.id) && (
              <div className="bg-[#242526] rounded-xl shadow-sm overflow-hidden">
                <PostingForm variant="profile" user={loggedInUser} />
              </div>
            )}

            {/* Bộ lọc bài viết */}
            <div className="bg-[#242526] p-4 rounded-xl flex items-center justify-between border border-gray-800">
              <h3 className="text-lg font-bold">Bài viết</h3>
              <div className="flex gap-2">
                <button className="bg-[#3a3b3c] hover:bg-[#4e4f50] px-3 py-1.5 rounded-md text-sm font-semibold transition">
                   Bộ lọc
                </button>
                <button className="bg-[#3a3b3c] hover:bg-[#4e4f50] px-3 py-1.5 rounded-md text-sm font-semibold transition">
                   Quản lý bài viết
                </button>
              </div>
            </div>

            {/* Danh sách bài viết */}
            <div className="space-y-4">
              <PostList userId={user.id} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profilepage;