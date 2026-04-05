import { useEffect, useState } from "react";
import FriendRequest from "./FriendRequest";

interface FriendRequestType {
  friendshipId: string | number;
  id: string | number;
  fullName: string;
  avatarUrl?: string;
}

const FriendRequestList = () => {
  const [requests, setRequests] = useState<FriendRequestType[]>([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.id;

  useEffect(() => {
    // Nếu không có userId thì tắt loading và thoát
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        setLoading(true);                    // Bắt đầu loading
        const res = await fetch(`http://localhost:8080/api/friends/${userId}/pending-requests`);
        
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách lời mời:", error);
        setRequests([]);
      } finally {
        setLoading(false);                   // Luôn tắt loading khi xong
      }
    };

    fetchRequests();

  }, [userId]);   // Chỉ phụ thuộc vào userId

  const handleAccept = async (friendshipId: string | number) => {
    try {
      await fetch(`http://localhost:8080/api/friends/${friendshipId}/accept`, {
        method: "POST",
      });
      setRequests((prev) => prev.filter((req) => req.friendshipId !== friendshipId));
    } catch (error) {
      console.error("Lỗi khi chấp nhận lời mời:", error);
    }
  };

  const handleReject = async (friendshipId: string | number) => {
    try {
      await fetch(`http://localhost:8080/api/friends/${friendshipId}/reject`, {
        method: "POST",
      });
      setRequests((prev) => prev.filter((req) => req.friendshipId !== friendshipId));
    } catch (error) {
      console.error("Lỗi khi từ chối lời mời:", error);
    }
  };

  return (
    <div className=" ">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          

          {requests.length > 0 && (
            <div className=" px-5 py-2.5 rounded-2xl shadow-sm border  text-sm font-medium text-gray-600">
              {requests.length} lời mời đang chờ
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              <p className="text-gray-500">Đang tải lời mời...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <div className="rounded-3xl shadow-sm border  py-24 text-center">
            <div className="mx-auto w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mb-8 text-6xl">
              👥
            </div>
            <h3 className="text-2xl font-semibold text-gray-400 mb-3">
              Chưa có lời mời kết bạn nào
            </h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              Khi ai đó gửi lời mời kết bạn cho bạn, họ sẽ xuất hiện tại đây.
            </p>
          </div>
        )}

        {/* List */}
        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {requests.map((req) => (
              <FriendRequest
                key={req.friendshipId}
                request={req}
                onAccept={handleAccept}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendRequestList;