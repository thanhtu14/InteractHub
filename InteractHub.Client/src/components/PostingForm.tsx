import { useState, useEffect } from "react";
import { FaUserCircle, FaVideo, FaImage, FaSmile } from "react-icons/fa";
import PostModal from "./PostModal";

interface PostingFormProps {
  user?: any;
  variant?: "home" | "profile";
}

const PostingForm = ({ user, variant = "home" }: PostingFormProps) => {
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div
      className={`bg-[#242526] border border-[#3e4042] rounded-3xl p-4 shadow-xl
        ${variant === "profile" ? "w-full" : "max-w-2xl mx-auto"}`}
    >
      {/* Phần nhập bài viết */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {currentUser?.avatarUrl ? (
            <img
              src={`http://localhost:8080/uploads/${currentUser.avatarUrl}`}
              alt="avatar"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-700"
              onError={(e) => {
                e.currentTarget.src = "/assets/img/icons8-user-default-64.png";
              }}
            />
          ) : (
            <FaUserCircle size={44} className="text-gray-400" />
          )}
        </div>

        {/* Nút mở form đăng bài */}
        <button
          onClick={() => setShowForm(true)}
          className="flex-1 bg-[#3a3b3c] hover:bg-[#4a4b4d] text-left text-gray-300 
                     text-[17px] py-3 px-5 rounded-full transition-all duration-200
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {currentUser?.fullName 
            ? `${currentUser.fullName} ơi, bạn đang nghĩ gì thế?` 
            : "Bạn đang nghĩ gì thế?"}
        </button>
      </div>

      {/* Thanh phân cách */}
      <div className="border-t border-[#3e4042] my-4" />

      {/* Các nút chức năng */}
      <div className="grid grid-cols-3 gap-2">
        <button className="flex items-center justify-center gap-3 py-3 hover:bg-[#3a3b3c] rounded-2xl transition-all text-gray-300">
          <FaVideo className="text-red-500" size={24} />
          <span className="font-medium text-sm">Video trực tiếp</span>
        </button>

        <button className="flex items-center justify-center gap-3 py-3 hover:bg-[#3a3b3c] rounded-2xl transition-all text-gray-300">
          <FaImage className="text-green-500" size={24} />
          <span className="font-medium text-sm">Ảnh/Video</span>
        </button>

        <button className="flex items-center justify-center gap-3 py-3 hover:bg-[#3a3b3c] rounded-2xl transition-all text-gray-300">
          <FaSmile className="text-orange-500" size={24} />
          <span className="font-medium text-sm">Cảm xúc/Hoạt động</span>
        </button>
      </div>

      {/* Post Modal */}
      {showForm && (
        <PostModal 
          user={user || currentUser} 
          onClose={() => setShowForm(false)} 
        />
      )}
    </div>
  );
};

export default PostingForm;