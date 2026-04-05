import { useEffect, useState } from "react";
import axios from "axios";
import SettingForm from "./SettingForm";

interface User {
  id: string | number;
  email: string;
  gender?: string;
  birthday?: string;
  bio?: string;
  createdAt: string;
  fullName?: string;
  
  // các trường khác nếu cần
}

interface InfoContainerProps {
  userId: string | number;
}

const InfoContainer = ({ userId }: InfoContainerProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Lấy thông tin user hiện tại từ localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUserId(parsedUser.id);
    }

    // Lấy thông tin người dùng cần hiển thị
    axios
      .get(`http://localhost:8080/auth/${userId}`)
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        console.error("Không thể lấy thông tin người dùng", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-[#242526] rounded-2xl p-8 text-center">
        <p className="text-gray-400">Đang tải thông tin...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#242526] rounded-2xl p-8 text-center">
        <p className="text-red-400">Không tìm thấy thông tin người dùng</p>
      </div>
    );
  }

  const isOwnProfile = currentUserId === userId;

  return (
    <div className="bg-[#242526] border border-gray-700 rounded-3xl p-8 shadow-xl">
      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-gray-700">
        Thông tin cá nhân
      </h3>

      {/* Thông tin chi tiết */}
      <div className="space-y-5 text-gray-300">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-medium text-gray-400 w-32">Email:</span>
          <span className="text-white">{user.email}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-medium text-gray-400 w-32">Giới tính:</span>
          <span className="text-white">
            {user.gender || "Chưa cập nhật"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-medium text-gray-400 w-32">Ngày sinh:</span>
          <span className="text-white">
            {user.birthday ? new Date(user.birthday).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <span className="font-medium text-gray-400 w-32 flex-shrink-0">Tiểu sử:</span>
          <span className="text-white leading-relaxed">
            {user.bio || "Chưa có tiểu sử"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-medium text-gray-400 w-32">Tham gia:</span>
          <span className="text-white">
            {new Date(user.createdAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Nút chỉnh sửa - chỉ hiển thị khi là profile của chính mình */}
      {isOwnProfile && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setIsEditing(true)}
            className="px-8 py-3 bg-[#3e4042] hover:bg-[#4a4c4f] active:bg-[#36383b]
                       text-white font-semibold text-base rounded-2xl transition-all duration-200
                       border border-gray-600 hover:border-gray-500"
          >
            Chỉnh sửa hồ sơ
          </button>
        </div>
      )}

      {/* Setting Form Modal */}
      {isEditing && (
        <SettingForm 
          user={user} 
          onClose={() => setIsEditing(false)} 
        />
      )}
    </div>
  );
};

export default InfoContainer;