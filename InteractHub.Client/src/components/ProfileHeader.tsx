import React, { useEffect, useState } from "react";
import { userService } from "../services/userService";
import { friendshipService } from "../services/friendshipService"; // Import service mới
import { type User } from "../schemas/user.schema";

interface ProfileHeaderProps {
  userId: string;
  isOwnProfile?: boolean;
  onEditProfileClick?: () => void;
}

const SERVER_BASE_URL = "https://localhost:7069";

const resolveUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${SERVER_BASE_URL}${path}`;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userId,
  isOwnProfile = false,
  onEditProfileClick,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false); // State để đổi trạng thái nút

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const res = await userService.getProfile(isOwnProfile ? undefined : userId);
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching header:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderData();
  }, [userId, isOwnProfile]);

  // ── Hàm xử lý kết bạn ──────────────────────────────────────
  const handleAddFriend = async () => {
    try {
      await friendshipService.sendFriendRequest(userId);
      setRequestSent(true);
      // Bạn có thể thêm Toast thông báo ở đây
      alert("Đã gửi lời mời kết bạn!"); 
    } catch (error) {
      console.error("Lỗi gửi lời mời:", error);
      alert("Không thể gửi lời mời lúc này.");
    }
  };

  if (loading) return <div className="h-96 bg-[#242526] animate-pulse rounded-b-xl" />;
  if (!user) return <div className="w-full bg-[#242526] p-10 text-center text-gray-400">Không tìm thấy thông tin.</div>;

  return (
    <div className="w-full bg-[#242526] pb-4">
      <div className="max-w-[1050px] mx-auto">
        {/* Cover Photo */}
        <div className="relative h-[200px] md:h-[350px] w-full bg-gray-800 rounded-b-xl overflow-hidden">
          <img
            src={resolveUrl(user.CoverUrl) || "/images/anh-bia.png"}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Avatar & Info */}
        <div className="px-4 md:px-8 pb-4">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 md:-mt-16 gap-4 relative z-10">
            <img
              src={resolveUrl(user.AvatarUrl) || "/images/default-avatar.png"}
              alt="avatar"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#242526] object-cover bg-gray-700"
            />

            <div className="flex-1 text-center md:text-left mb-2">
              <h2 className="text-3xl font-bold text-white">{user.Username}</h2>
              <p className="text-gray-400 font-medium mt-1">{user.Bio || "Chưa có tiểu sử"}</p>
            </div>

            <div className="flex gap-2 mb-2">
              {isOwnProfile ? (
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#1877f2] hover:bg-blue-600 text-white rounded-lg font-bold">
                    + Thêm vào tin
                  </button>
                  <button
                    onClick={onEditProfileClick}
                    className="px-4 py-2 bg-[#3a3b3c] hover:bg-[#4e4f50] text-white rounded-lg font-bold"
                  >
                    ✎ Chỉnh sửa trang cá nhân
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleAddFriend}
                  disabled={requestSent}
                  className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${
                    requestSent 
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed" 
                      : "bg-[#1877f2] hover:bg-blue-600 text-white"
                  }`}
                >
                  {requestSent ? "✓ Đã gửi lời mời" : "+ Thêm bạn bè"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;