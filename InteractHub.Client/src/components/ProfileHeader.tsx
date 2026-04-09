import { useEffect, useState } from "react";

const API_BASE_URL = "https://localhost:7069";

interface ProfileHeaderProps {
  userId: string;
  isOwnProfile?: boolean;
  onEditProfileClick?: () => void;
}

interface User {
  Id: string;
  Username: string;
  Email: string;
  AvatarUrl?: string | null;
  CoverUrl?: string | null;
  Bio?: string | null;
  Roles?: string[];
}

// Ghép base URL nếu path là relative (bắt đầu bằng /)
const resolveUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path; // Đã là full URL (Google, GitHub avatar,...)
  return `${API_BASE_URL}${path}`;          // VD: /avatars/xxx.jpg → https://localhost:7069/avatars/xxx.jpg
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userId,
  isOwnProfile = false,
  onEditProfileClick,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("interact_hub_token");

  useEffect(() => {
    const fetchHeaderData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const url = isOwnProfile
          ? `${API_BASE_URL}/api/users/me`
          : `${API_BASE_URL}/api/users/${userId}`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Lỗi fetch profile:", response.status);
        }
      } catch (error) {
        console.error("Error fetching header:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId || isOwnProfile) fetchHeaderData();
  }, [userId, isOwnProfile, token]);

  if (loading) {
    return <div className="h-96 bg-[#242526] animate-pulse rounded-b-xl" />;
  }

  if (!user) {
    return (
      <div className="w-full bg-[#242526] p-10 text-center text-gray-400">
        Không tìm thấy thông tin người dùng.
      </div>
    );
  }

  const avatarSrc = resolveUrl(user.AvatarUrl);
  const coverSrc  = resolveUrl(user.CoverUrl);

  return (
    <div className="w-full bg-[#242526] pb-4">
      <div className="max-w-[1050px] mx-auto">
        {/* Cover Photo */}
        <div className="relative h-[200px] md:h-[350px] w-full bg-gray-800 rounded-b-xl overflow-hidden">
          <img
            src={coverSrc || "/images/anh-bia.png"}
            alt="cover"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/images/anh-bia.png";
            }}
          />
        </div>

        {/* Avatar & Info */}
        <div className="px-4 md:px-8 pb-4">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 md:-mt-16 gap-4">
            <div className="relative">
              <img
                src={avatarSrc || "/images/default-avatar.png"}
                alt="avatar"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#242526] object-cover bg-gray-700"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/default-avatar.png";
                }}
              />
            </div>

            <div className="flex-1 text-center md:text-left mb-2">
              <h2 className="text-3xl font-bold text-white">{user.Username}</h2>
              <p className="text-gray-400 font-medium mt-1">
                {user.Bio || "Chưa có tiểu sử"}
              </p>
            </div>

            <div className="flex gap-2 mb-2">
              {isOwnProfile ? (
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-[#1877f2] hover:bg-blue-600 text-white rounded-lg font-bold transition">
                    + Thêm vào tin
                  </button>
                  <button
                    onClick={onEditProfileClick}
                    className="px-4 py-2 bg-[#3a3b3c] hover:bg-[#4e4f50] text-white rounded-lg font-bold transition"
                  >
                    ✎ Chỉnh sửa trang cá nhân
                  </button>
                </div>
              ) : (
                <button className="px-4 py-2 bg-[#1877f2] hover:bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 transition">
                  + Thêm bạn bè
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