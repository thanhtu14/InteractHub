import React from "react";
import { FaMessage } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { resolveUrl } from "../utils/urlUtils"; // ✅ Tái sử dụng hàm định dạng thời gian chuẩn

interface FriendProps {
  friend: {
    id: string | number;
    fullName: string;
    avatarUrl?: string | null;
  };
}
const Friend: React.FC<FriendProps> = ({ friend }) => {
  const navigate = useNavigate();

  const handleGoToProfile = () => {
    navigate(`/profile/${friend.id}`);
  };

  return (
    <div
      onClick={handleGoToProfile}
      className="group flex items-center gap-3 p-2 hover:bg-[#3a3b3c] 
                 rounded-xl transition-all duration-200 cursor-pointer"
    >
      {/* Avatar Section */}
      <div className="relative flex-shrink-0">
        <img
          // Sử dụng resolveUrl và ảnh mặc định giống ProfileHeader
          src={resolveUrl(friend.avatarUrl) || "/images/default-avatar.png"}
          alt={friend.fullName}
          className="w-15 h-15 rounded-full object-cover border border-gray-700 
                     group-hover:border-gray-500 transition-all"
        />
        {/* Status dot: Chấm xanh online */}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#18191a] rounded-full"></div>
      </div>

      {/* Info Section */}
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-medium text-white truncate">
          {friend.fullName}
        </p>
        <p className="text-[14px] text-gray-400">Bạn bè</p>
      </div>

      {/* Hover Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <button
          title="Nhắn tin"
          onClick={(e) => {
            e.stopPropagation();
            // Logic mở chat box của bạn ở đây
          }}
          className="w-10 h-10 flex items-center justify-center bg-[#4e4f50] 
                     hover:bg-[#5e5f61] text-white rounded-full transition-colors"
        >
          <FaMessage size={12} />
        </button>

        
      </div>
    </div>
  );
};

export default Friend;