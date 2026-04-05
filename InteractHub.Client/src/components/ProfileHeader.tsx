import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import axios from "axios"; // BẬT LẠI KHI CÓ BE

interface ProfileHeaderProps {
  userId: string | number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ userId }) => {
  const [user, setUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<any>(null);
  const [friendRequestStatus, setFriendRequestStatus] = useState<string | null>("NONE");
  const navigate = useNavigate();

  // --- MOCK DATA LOGIC (XÓA KHI CÓ BE) ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : { id: "1" };
    setCurrentUserId(parsedUser.id);

    // Giả lập lấy thông tin user từ API
    const mockUser = {
      username: userId === parsedUser.id ? "Bùi Gia Quang Vinh" : "Người Bạn Demo",
      bio: "Software Engineering Student | Đang làm đồ án tốt nghiệp 🚀",
      avatarUrl: `https://i.pravatar.cc/150?u=${userId}`,
      coverUrl: "https://picsum.photos/1200/400", // Ảnh bìa giả
    };
    setUser(mockUser);
    
    // Giả lập trạng thái kết bạn: Nếu không phải mình thì mặc định là NONE
    if (userId !== parsedUser.id) {
        setFriendRequestStatus("NONE"); 
    }
  }, [userId]);

  // --- BE LOGIC (BẬT LẠI KHI CÓ BE) ---
  /*
  const handleSendFriendRequest = async () => {
    try {
      await axios.post(`http://localhost:8080/api/friends/request`, null, {
        params: { senderId: currentUserId, receiverId: userId }
      });
      setFriendRequestStatus("SENT");
    } catch (error) { setFriendRequestStatus("error"); }
  };

  const handleAcceptRequest = async () => {
    try {
      await axios.post(`http://localhost:8080/api/friends/accept`, null, {
        params: { senderId: userId, receiverId: currentUserId }
      });
      setFriendRequestStatus("FRIENDS");
    } catch (error) { alert("Lỗi xác nhận!"); }
  };

  const handleUnfriend = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/friends/unfriend`, {
        params: { userId1: currentUserId, userId2: userId }
      });
      setFriendRequestStatus("NONE");
    } catch (error) { alert("Lỗi hủy kết bạn!"); }
  };
  */

  // --- GIẢ LẬP CLICK CHO MOCK DATA ---
  const handleMockAction = (status: string) => {
    setFriendRequestStatus(status);
  };

  if (!user) return <div className="h-96 bg-[#242526] animate-pulse rounded-b-xl" />;

  return (
    <div className="w-full bg-[#242526] pb-4">
      <div className="max-w-[1050px] mx-auto">
        {/* 1. Ảnh bìa (Cover Photo) */}
        <div className="relative h-[200px] md:h-[350px] w-full bg-gray-800 rounded-b-xl overflow-hidden">
          <img 
            src={user.coverUrl} 
            alt="cover" 
            className="w-full h-full object-cover"
          />
          <button className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition">
            📷 Chỉnh sửa ảnh bìa
          </button>
        </div>

        {/* 2. Phần Avatar và Thông tin */}
        <div className="px-4 md:px-8 pb-4">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 md:-mt-16 gap-4">
            {/* Avatar */}
            <div className="relative">
              <img 
                src={user.avatarUrl} 
                alt="avatar" 
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#242526] object-cover bg-gray-700"
              />
              <div className="absolute bottom-3 right-3 w-8 h-8 bg-[#3a3b3c] hover:bg-[#4e4f50] rounded-full flex items-center justify-center cursor-pointer border border-gray-600">
                📷
              </div>
            </div>

            {/* Tên & Bio */}
            <div className="flex-1 text-center md:text-left mb-2">
              <h2 className="text-3xl font-bold text-white">{user.username}</h2>
              <p className="text-gray-400 font-medium mt-1">{user.bio}</p>
            </div>

            {/* Nút hành động (Hệ thống kết bạn) */}
            <div className="flex gap-2 mb-2">
              {currentUserId !== userId ? (
                <div className="flex gap-2">
                  {friendRequestStatus === "FRIENDS" && (
                    <>
                      <button className="px-4 py-2 bg-[#3a3b3c] text-white rounded-lg font-bold cursor-default">✓ Bạn bè</button>
                      <button onClick={() => handleMockAction("NONE")} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition">Hủy kết bạn</button>
                    </>
                  )}
                  {friendRequestStatus === "SENT" && (
                    <button onClick={() => handleMockAction("NONE")} className="px-4 py-2 bg-[#3a3b3c] text-white rounded-lg font-bold transition">Đã gửi lời mời (Hủy)</button>
                  )}
                  {friendRequestStatus === "PENDING" && (
                    <>
                      <button onClick={() => handleMockAction("FRIENDS")} className="px-4 py-2 bg-[#1877f2] hover:bg-blue-600 text-white rounded-lg font-bold transition">Xác nhận</button>
                      <button onClick={() => handleMockAction("NONE")} className="px-4 py-2 bg-[#3a3b3c] hover:bg-[#4e4f50] text-white rounded-lg font-bold transition">Từ chối</button>
                    </>
                  )}
                  {friendRequestStatus === "NONE" && (
                    <button onClick={() => handleMockAction("SENT")} className="px-4 py-2 bg-[#1877f2] hover:bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 transition">
                      + Thêm bạn bè
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#1877f2] hover:bg-blue-600 text-white rounded-lg font-bold transition">+ Thêm vào tin</button>
                  <button className="px-4 py-2 bg-[#3a3b3c] hover:bg-[#4e4f50] text-white rounded-lg font-bold transition">✎ Chỉnh sửa trang cá nhân</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Navigation Tab (Dưới Header) */}
        <div className="border-t border-gray-700 mx-4 md:mx-8 mt-2 flex gap-1">
          {["Bài viết", "Giới thiệu", "Bạn bè", "Ảnh", "Video", "Check-in"].map((tab, index) => (
            <button key={tab} className={`px-4 py-4 text-sm font-semibold rounded-lg hover:bg-[#3a3b3c] transition ${index === 0 ? "text-[#1877f2] border-b-4 border-[#1877f2] rounded-none" : "text-gray-400"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;