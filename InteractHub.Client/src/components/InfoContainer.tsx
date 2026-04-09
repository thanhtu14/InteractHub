// InfoContainer.tsx
import { useState } from "react";
import SettingForm from "./SettingForm";

// ── Interface khớp với UserDto từ Backend ─────────────────────
export interface User {
  Id: string;
  Username: string;
  Email: string;
  AvatarUrl?: string | null;
  CoverUrl?: string | null;
  DateOfBirth?: string | null;
  CreatedAt?: string | null;
  Gender?: string | null;
  Bio?: string | null;
  Roles: string[];
}

interface InfoContainerProps {
  user: User;                  // Nhận user trực tiếp từ ProfilePage
  isOwnProfile?: boolean;      // Có phải trang của chính mình
}

const InfoContainer: React.FC<InfoContainerProps> = ({ user, isOwnProfile = false }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-[#242526] border border-gray-700 rounded-3xl p-8 shadow-xl">
      <h4 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-gray-700">
        Thông tin cá nhân
      </h4>

      <div className="space-y-5 text-gray-300">
        {/* Username */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-medium text-gray-400 w-32">Tên:</span>
          <span className="text-white">{user.Username || "Chưa cập nhật"}</span>
        </div>

        {/* Email */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-medium text-gray-400 w-32">Email:</span>
          <span className="text-white">{user.Email}</span>
        </div>

        {/* Gender */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-medium text-gray-400 w-32">Giới tính:</span>
          <span className="text-white">{user.Gender || "Chưa cập nhật"}</span>
        </div>

        {/* DateOfBirth */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-medium text-gray-400 w-32">Ngày sinh:</span>
          <span className="text-white">
            {user.DateOfBirth
              ? new Date(user.DateOfBirth).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              : "Không rõ"}
          </span>
        </div>

        {/* Bio */}
        <div className="flex flex-col sm:flex-row gap-2">
          <span className="font-medium text-gray-400 w-32 flex-shrink-0">Tiểu sử:</span>
          <span className="text-white leading-relaxed">{user.Bio || "Chưa có tiểu sử"}</span>
        </div>

        {/* CreatedAt */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="font-medium text-gray-400 w-32">Tham gia:</span>
          <span className="text-white">
            {user.CreatedAt
              ? new Date(user.CreatedAt).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              : "Không rõ"}
          </span>
        </div>
      </div>
      {/* Form chỉnh sửa */}
      {isEditing && (
        <SettingForm user={user} onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
};

export default InfoContainer;