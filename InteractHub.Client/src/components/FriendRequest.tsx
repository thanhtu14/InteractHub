import { useState } from "react";

interface FriendRequestProps {
  request: {
    friendshipId?: string | number;   // Ưu tiên dùng cái này nếu có
    id: string | number;
    fullName: string;
    avatarUrl?: string;
  };
  onAccept: (id: string | number) => Promise<void>;
  onReject: (id: string | number) => Promise<void>;
}

const FriendRequest = ({ request, onAccept, onReject }: FriendRequestProps) => {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<"accept" | "reject" | null>(null);

  const handleAccept = async () => {
    setLoading(true);
    setActionType("accept");
    try {
      await onAccept(request.friendshipId || request.id);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    setActionType("reject");
    try {
      await onReject(request.friendshipId || request.id);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  return (
    <div className="group bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-[420px]">
      
      {/* Avatar Section */}
      <div className="relative h-60 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={
            request.avatarUrl
              ? `http://localhost:8080/uploads/${request.avatarUrl}`
              : "/assets/img/icons8-user-default-64.png"
          }
          alt={request.fullName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay gradient nhẹ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Info & Actions */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex-1">
          <h3 className="font-semibold text-xl text-gray-900 line-clamp-2 leading-tight">
            {request.fullName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            ID: {request.id}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-3 pt-4">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 
                       disabled:bg-blue-400 text-white font-semibold text-base rounded-2xl 
                       transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
          >
            {loading && actionType === "accept" ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Đang xác nhận...
              </>
            ) : (
              "Xác nhận"
            )}
          </button>

          <button
            onClick={handleReject}
            disabled={loading}
            className="w-full py-3.5 bg-white border border-gray-300 hover:bg-gray-100 
                       active:bg-gray-200 text-gray-700 font-semibold text-base rounded-2xl 
                       transition-all duration-200 disabled:opacity-70"
          >
            {loading && actionType === "reject" ? (
              <>
                <span className="animate-spin h-5 w-5 border-2 border-gray-600 border-t-transparent rounded-full" />
                Đang xóa...
              </>
            ) : (
              "Xóa lời mời"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequest;