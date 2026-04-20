import React, { useState } from "react";
import { FaUserCircle, FaVideo, FaImage, FaSmile } from "react-icons/fa";
import PostModal from "./PostModal";
import { useAuth } from "../context/useAuth"; // ✅ import hook
import { resolveUrl } from "../utils/urlUtils"; // ✅ Tái sử dụng hàm định dạng thời gian chuẩn

interface PostingFormProps {
  user?: any;
  variant?: "home" | "profile";
}

const PostingForm: React.FC<PostingFormProps> = ({  variant = "home" }) => {
  const [showForm, setShowForm] = useState(false);
  const { user: authUser } = useAuth(); // ✅ lấy user từ AuthContext

  // Ưu tiên user từ prop (Profile) > user từ AuthContext
  const displayUser = authUser;

  return (
    <div
      className={`bg-[#242526] border border-[#3e4042] rounded-3xl p-5 shadow-xl
        ${variant === "profile" ? "w-full" : "max-w-2xl mx-auto"}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          {displayUser?.AvatarUrl ? (
            <img
              src={resolveUrl(displayUser.AvatarUrl)}
              alt="avatar"
              className="w-15 h-15 rounded-full object-cover ring-2 ring-gray-700 hover:ring-[#1877f2] transition-all"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/images/default-avatar.png";
              }}
            />
          ) : (
            <FaUserCircle size={44} className="text-gray-400" />
          )}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex-1 bg-[#3a3b3c] hover:bg-[#4a4b4d] text-left text-gray-300 
             text-[17px] py-3.5 px-5 rounded-full transition-all duration-200
             focus:outline-none focus:ring-2 focus:ring-[#1877f2] active:scale-[0.985]"
        >
          {(() => {
            const name = displayUser?.Username;
            if (!name) return "Bạn đang nghĩ gì?";
            const lastName = name.trim().split(" ").pop();
            return `${lastName} ơi, bạn đang nghĩ gì?`;
          })()}
        </button>
      </div>

      <div className="border-t border-[#3e4042] my-4" />

      <div className="grid grid-cols-3 gap-2">
        <ActionButton icon={<FaVideo className="text-red-500" />} label="Video trực tiếp" />
        <ActionButton icon={<FaImage className="text-green-500" />} label="Ảnh/Video" />
        <ActionButton icon={<FaSmile className="text-orange-500" />} label="Cảm xúc/Hoạt động" />
      </div>

      {showForm && (
        <PostModal
          user={displayUser}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

const ActionButton = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <button
    className="flex items-center justify-center gap-3 py-3.5 hover:bg-[#3a3b3c] 
               rounded-2xl transition-all duration-200 text-gray-300 hover:text-white group"
  >
    <div className="group-hover:scale-110 transition-transform duration-200">
      {icon}
    </div>
    <span className="font-medium text-sm">{label}</span>
  </button>
);

export default PostingForm;