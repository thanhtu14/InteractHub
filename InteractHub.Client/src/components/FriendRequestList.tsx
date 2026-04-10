import { useEffect, useState } from "react";
import FriendRequest from "./FriendRequest";
import { friendshipService } from "../services/friendshipService";

const FriendRequestList = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Lấy User từ LocalStorage để check login
  const userString = localStorage.getItem("interact_hub_user");
  const userId = userString ? JSON.parse(userString)?.Id : null;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchPendingRequests = async () => {
      try {
        setLoading(true);
        const res = await friendshipService.getPendingRequests();
        const data = res.data;
        
        // Đảm bảo map đúng tên thuộc tính từ Backend trả về
        // Lưu ý: Kiểm tra Console xem item.requesterId hay item.RequesterId
        const formattedData = data.map((item: any) => ({
          id: item.requesterId || item.RequesterId, // Đây là ID của người gửi (để vào profile)
          fullName: item.requesterName || item.RequesterName,
          avatarUrl: item.avatarUrl || item.AvatarUrl,
          createdAt: item.createdAt || item.CreatedAt,
        }));

        setRequests(Array.isArray(formattedData) ? formattedData : []);
      } catch (error) {
        console.error("Lỗi lấy danh sách:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, [userId]);

  const handleAccept = async (requesterId: string | number) => {
    try {
      // Backend của bạn: RespondToRequestAsync(userId, dto) 
      // yêu cầu dto.RequesterId
      await friendshipService.acceptRequest(requesterId.toString());
      
      // Sau khi chấp nhận thành công, xóa khỏi danh sách UI
      setRequests((prev) => prev.filter((req) => req.id !== requesterId));
    } catch (error) {
      console.error("Lỗi khi chấp nhận:", error);
    }
  };

  const handleReject = async (requesterId: string | number) => {
    try {
      // Backend của bạn: RejectRequestAsync(userId, requesterId)
      await friendshipService.rejectRequest(requesterId.toString());
      
      // Xóa khỏi danh sách UI
      setRequests((prev) => prev.filter((req) => req.id !== requesterId));
    } catch (error) {
      console.error("Lỗi khi từ chối:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 px-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse items-center p-2">
            <div className="w-14 h-14 bg-[#3a3b3c] rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-[#3a3b3c] rounded w-1/2"></div>
              <div className="h-8 bg-[#3a3b3c] rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="mx-2 p-4 text-center rounded-xl border border-gray-800/50 bg-[#242526]">
        <p className="text-gray-500 text-[13px]">Không có lời mời kết bạn mới</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-hidden">
      {requests.map((req) => (
        <FriendRequest
          key={req.id}
          request={req}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ))}
    </div>
  );
};

export default FriendRequestList;