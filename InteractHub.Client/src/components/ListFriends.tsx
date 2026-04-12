import { useEffect, useState } from "react";
import Friend from "./Friends";
import { friendshipService } from "../services/friendshipService";

// ── Interface BE (PascalCase - khớp C# DTO) ──────────────────
interface FriendResponseDto {
  Id: string;
  Username: string;
  AvatarUrl?: string;
}

// ── Interface FE (camelCase - dùng trong component) ───────────
interface FriendType {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

// ── Map BE → FE ───────────────────────────────────────────────
const mapFriend = (item: FriendResponseDto): FriendType => ({
  id: item.Id,
  fullName: item.Username || "Người dùng",
  avatarUrl: item.AvatarUrl,
});

const removeVietnameseTones = (str: string | undefined | null) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

const FriendList = () => {
  const [friends, setFriends] = useState<FriendType[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const user = JSON.parse(localStorage.getItem("interact_hub_user") || "{}");
  const currentUserId = user?.Id || "859ec493-a205-4b84-8681-8e0507090a0e";

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const res = await friendshipService.getFriendsList(currentUserId);
        setFriends((res.data as FriendResponseDto[]).map(mapFriend));
      } catch (error) {
        console.error("Lỗi khi tải danh sách bạn bè:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) fetchFriends();
  }, [currentUserId]);

  const filteredFriends = friends.filter((f) =>
    removeVietnameseTones(f.fullName).includes(removeVietnameseTones(keyword))
  );

  return (
    <div className="flex flex-col h-full bg-[#18191a] text-white">
      {/* Search Header */}
      <div className="p-4 sticky top-0 bg-[#18191a] z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-400 font-bold uppercase text-xs tracking-widest">
            Người liên hệ
          </h2>
          <span className="text-[11px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
            {friends.length} bạn bè
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-[#3a3b3c] py-2 pl-10 pr-4 rounded-full text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>
      </div>

      {/* Friends Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 no-scrollbar">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
              <div className="w-10 h-10 bg-[#3a3b3c] rounded-full" />
              <div className="h-3 bg-[#3a3b3c] rounded w-24" />
            </div>
          ))
        ) : filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => (
            <Friend key={friend.id} friend={friend} />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 text-sm">
            Không tìm thấy kết quả nào
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendList;