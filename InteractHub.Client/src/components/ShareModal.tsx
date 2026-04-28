import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/useAuth"; 
import { friendshipService, type UserDto } from "../services/friendshipService";
import { messageService } from "../services/messageService";
import { resolveUrl } from "../utils/urlUtils";
import { removeVietnameseTones } from "../utils/stringUtils";

interface FriendType {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

interface ShareModalProps {
  post: {
    id: string | number;
    title?: string;
  };
  onClose: () => void;
}

const ShareModal = ({ post, onClose }: ShareModalProps) => {
  const { user } = useAuth();
  
  // States
  const [friends, setFriends] = useState<FriendType[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sendingIds, setSendingIds] = useState<string[]>([]); // Lưu danh sách ID đã bấm gửi

  // URL chia sẻ
  const shareUrl = `${window.location.origin}/post/${post.id}`;

  // 1. Logic Sao chép liên kết
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 2. Logic Gửi tin nhắn chia sẻ
  const handleSend = async (friendId: string) => {
    if (sendingIds.includes(friendId)) return;

    try {
      // Đánh dấu đang gửi (hoặc đã gửi) để tránh spam nút
      setSendingIds((prev) => [...prev, friendId]);

      // Bước A: Lấy hoặc tạo cuộc hội thoại
      const convRes = await messageService.getOrCreateConversation(friendId);
      const conversationId = convRes.data.id;

      // Bước B: Gửi nội dung bài viết
      const shareContent = `${shareUrl}`;
      await messageService.sendMessage(conversationId, shareContent);

      console.log(`Đã chia sẻ cho ${friendId} thành công`);
    } catch (error) {
      console.error("Lỗi khi chia sẻ:", error);
      alert("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
      // Xóa khỏi danh sách đã gửi nếu thất bại để có thể bấm lại
      setSendingIds((prev) => prev.filter(id => id !== friendId));
    }
  };

  // 3. Lấy danh sách bạn bè từ API
  useEffect(() => {
    if (!user?.Id) return;

    const fetchFriends = async () => {
      try {
        setLoading(true);
        const res = await friendshipService.getFriendsList(user.Id);
        // Cast dữ liệu về UserDto để tránh lỗi 'any'
        const mappedFriends = (res.data as UserDto[]).map((f) => ({
          id: f.Id,
          fullName: f.Username || "Người dùng",
          avatarUrl: f.AvatarUrl,
        }));
        setFriends(mappedFriends);
      } catch (error) {
        console.error("Lỗi tải danh sách bạn bè:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user?.Id]);

  // 4. Logic lọc bạn bè theo tìm kiếm
  const filteredFriends = useMemo(() => {
    return friends.filter((f) =>
      removeVietnameseTones(f.fullName.toLowerCase()).includes(
        removeVietnameseTones(searchKeyword.toLowerCase())
      )
    );
  }, [friends, searchKeyword]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#242526] border border-[#3e4042] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-[#3e4042] flex justify-between items-center">
          <h3 className="text-lg font-bold text-white text-center flex-1">Chia sẻ bài viết</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-[#3a3b3c] flex items-center justify-center hover:bg-[#4e4f50] transition text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Section: Sao chép Link */}
          <div>
            <p className="text-gray-400 text-[11px] mb-2 font-bold uppercase tracking-widest">Liên kết bài viết</p>
            <div className="flex gap-2">
              <input 
                readOnly 
                value={shareUrl} 
                className="flex-1 bg-[#3a3b3c] border border-[#4e4f50] rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-blue-500"
              />
              <button 
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all whitespace-nowrap ${
                  copied ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {copied ? "Đã chép" : "Sao chép"}
              </button>
            </div>
          </div>

          {/* Section: Tìm kiếm & Danh sách bạn bè */}
          <div className="flex flex-col gap-3">
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Gửi qua tin nhắn</p>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm bạn bè..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-[#3a3b3c] border border-[#4e4f50] py-2 pl-9 pr-4 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            </div>

            {/* List Friends Container */}
            <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar min-h-[120px]">
              {loading ? (
                // Loading Skeletons
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-10 h-10 bg-[#3a3b3c] rounded-full" />
                    <div className="h-4 bg-[#3a3b3c] rounded w-32" />
                  </div>
                ))
              ) : filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => {
                  const isSent = sendingIds.includes(friend.id);
                  return (
                    <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-[#3a3b3c] rounded-xl transition group">
                      <div className="flex items-center gap-3">
                        <img 
                          src={friend.avatarUrl ? resolveUrl(friend.avatarUrl) : "/assets/img/icons8-user-default-64.png"} 
                          alt={friend.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-700"
                          onError={(e) => { e.currentTarget.src = "/assets/img/icons8-user-default-64.png"; }}
                        />
                        <span className="text-white text-sm font-medium">{friend.fullName}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleSend(friend.id)}
                        disabled={isSent}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          isSent 
                            ? "bg-gray-700 text-gray-400 cursor-default" 
                            : "bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        {isSent ? "Đã gửi" : "Gửi"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm italic">
                  {searchKeyword ? "Không tìm thấy bạn bè này" : "Danh sách bạn bè trống"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;