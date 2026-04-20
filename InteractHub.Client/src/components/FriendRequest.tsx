import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { resolveUrl } from "../utils/urlUtils"; // ✅ Tái sử dụng hàm định dạng thời gian chuẩn
import { getTimeAgo } from "../utils/timeUtils"; // ✅ Tái sử dụng hàm định dạng thời gian chuẩn
interface FriendRequestProps {
  request: {
    friendshipId?: string | number;
    id: string | number; // Đây là ID của người gửi (RequesterId)
    fullName: string;
    avatarUrl?: string | null;
    createdAt?: string; 
  };
  onAccept: (id: string | number) => Promise<void>;
  onReject: (id: string | number) => Promise<void>;
}

const FriendRequest = ({ request, onAccept, onReject }: FriendRequestProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  
  const navigate = useNavigate(); // 2. Khởi tạo navigate

  // 3. Hàm xử lý chuyển hướng
  const handleGoToProfile = () => {
    navigate(`/profile/${request.id}`);
  };

  const handleAction = async (e: React.MouseEvent, type: "accept" | "reject") => {
    e.stopPropagation(); // 4. Quan trọng: Ngăn chặn sự kiện nổi bọt để không kích hoạt handleGoToProfile
    setIsProcessing(true);
    setAction(type);
    try {
      const targetId = request.friendshipId || request.id;
      if (type === "accept") await onAccept(targetId);
      else await onReject(targetId);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setAction(null);
    }
  };

  return (
    <div 
      onClick={handleGoToProfile} // 5. Lắng nghe sự kiện click trên toàn bộ item
      className="group flex items-center gap-3 p-2 rounded-xl hover:bg-[#3a3b3c] transition-all duration-200 ease-in-out cursor-pointer"
    >
      {/* Avatar Section */}
      <div className="relative flex-shrink-0">
        <img
          src={resolveUrl(request.avatarUrl)}
          alt={request.fullName}
          className="w-20 h-20 rounded-full object-cover shadow-sm border border-[#3e4042] group-hover:border-[#4e4f50] transition-colors"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/default-avatar.png";
          }}
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-2">
          <h4 className="text-[16px] font-semibold text-[#e4e6eb] truncate pr-2 group-hover:underline">
            {request.fullName}
          </h4>
          
          <span className="text-[11px] text-[#b0b3b8] whitespace-nowrap italic font-medium">
            {getTimeAgo(request.createdAt)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            disabled={isProcessing}
            onClick={(e) => handleAction(e, "accept")}
            className="flex-1 py-1.5 bg-[#1877f2] hover:bg-[#166fe5] disabled:bg-[#254f85] 
                       text-white text-[13px] font-bold rounded-lg transition-all
                       flex items-center justify-center min-h-[32px] active:scale-95"
          >
            {isProcessing && action === "accept" ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
            ) : "Xác nhận"}
          </button>

          <button
            disabled={isProcessing}
            onClick={(e) => handleAction(e, "reject")}
            className="flex-1 py-1.5 bg-[#3a3b3c] hover:bg-[#4e4f50] disabled:opacity-50
                       text-[#e4e6eb] text-[13px] font-bold rounded-lg transition-all
                       flex items-center justify-center min-h-[32px] active:scale-95"
          >
            {isProcessing && action === "reject" ? (
              <div className="h-4 w-4 border-2 border-[#b0b3b8] border-t-transparent animate-spin rounded-full"></div>
            ) : "Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequest;