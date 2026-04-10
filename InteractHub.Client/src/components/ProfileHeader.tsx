import React, { useEffect, useState } from "react";
import { userService } from "../services/userService";
import { friendshipService } from "../services/friendshipService";
import { type User } from "../schemas/user.schema";
import { toast } from "react-toastify";

interface ProfileHeaderProps {
  userId: string;
  isOwnProfile?: boolean;
  onEditProfileClick?: () => void;
}

interface FriendshipStatus {
  status: number | null;
  isRequester: boolean;
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
  const [friendship, setFriendship] = useState<FriendshipStatus | null>(null);

  // ── Load data ───────────────────────────────────────────
  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const res = await userService.getProfile(
          isOwnProfile ? undefined : userId
        );
        setUser(res.data);

        if (!isOwnProfile) {
          const statusRes = await friendshipService.getFriendshipStatus(userId);

          // 🔥 FIX CASE BACKEND (Status → status)
          const data = statusRes.data;
          console.log('hdhdh', data)

          setFriendship({
            status: data.status ?? null,
            isRequester: data.isRequester ?? false,
          });
        }
      } catch (error) {
        console.error("Error fetching header:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderData();
  }, [userId, isOwnProfile]);

  const status = friendship?.status ?? null;
  const isRequester = friendship?.isRequester ?? false;

  // ── Actions ─────────────────────────────────────────────
  const handleAddFriend = async () => {
    try {
      await friendshipService.sendFriendRequest(userId);
      setFriendship({ status: 0, isRequester: true });
      toast.success("Đã gửi lời mời kết bạn!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể gửi lời mời.");
    }
  };

  const handleCancelRequest = async () => {
    try {
      await friendshipService.cancelRequest(userId);
      setFriendship(null);
      toast.info("Đã hủy lời mời.");
    } catch (error) {
      console.error(error);
      toast.error("Không thể hủy.");
    }
  };

  const handleAccept = async () => {
    try {
      await friendshipService.acceptRequest(userId);
      setFriendship({ status: 1, isRequester: false });
      toast.success("Đã chấp nhận!");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi.");
    }
  };

  const handleReject = async () => {
    try {
      await friendshipService.rejectRequest(userId);
      setFriendship(null);
      toast.info("Đã từ chối.");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi.");
    }
  };

  if (loading)
    return <div className="h-96 bg-[#242526] animate-pulse rounded-b-xl" />;

  if (!user)
    return (
      <div className="w-full bg-[#242526] p-10 text-center text-gray-400">
        Không tìm thấy thông tin.
      </div>
    );

  return (
    <div className="w-full bg-[#242526] pb-4">
      <div className="max-w-[1050px] mx-auto">
        {/* Cover */}
        <div className="relative h-[200px] md:h-[350px] w-full bg-gray-800 rounded-b-xl overflow-hidden">
          <img
            src={resolveUrl(user.CoverUrl) || "/images/anh-bia.png"}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Avatar + Info */}
        <div className="px-4 md:px-8 pb-4">
          <div className="flex flex-col md:flex-row items-center md:items-end -mt-12 md:-mt-16 gap-4 relative z-20">
            {/* Avatar */}
            <img
              src={resolveUrl(user.AvatarUrl) || "/images/default-avatar.png"}
              alt="avatar"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#242526] bg-black"
            />

            {/* Info */}
            <div className="flex-1 text-center md:text-left mb-2">
              <h2 className="text-3xl font-bold text-white">
                {user.Username}
              </h2>
              <p className="text-gray-400 mt-1">
                {user.Bio || "Chưa có tiểu sử"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-2">
              {isOwnProfile ? (
                <>
                  <button className="px-4 py-2 bg-[#1877f2] text-white rounded-lg font-bold">
                    + Thêm vào tin
                  </button>
                  <button
                    onClick={onEditProfileClick}
                    className="px-4 py-2 bg-[#3a3b3c] text-white rounded-lg font-bold"
                  >
                    ✎ Chỉnh sửa
                  </button>
                </>
              ) : (
                <>
                  {status === null && (
                    <button
                      onClick={handleAddFriend}
                      className="px-4 py-2 bg-[#1877f2] text-white rounded-lg font-bold"
                    >
                      + Thêm bạn bè
                    </button>
                  )}

                  {status === 0 && isRequester && (
                    <button
                      onClick={handleCancelRequest}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg font-bold"
                    >
                      ✓ Đã gửi (Hủy)
                    </button>
                  )}

                  {status === 0 && !isRequester && (
                    <>
                      <button
                        onClick={handleAccept}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold"
                      >
                        ✓ Chấp nhận
                      </button>
                      <button
                        onClick={handleReject}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold"
                      >
                        ✕ Từ chối
                      </button>
                    </>
                  )}

                  {status === 1 && (
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold">
                      ✓ Bạn bè
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;