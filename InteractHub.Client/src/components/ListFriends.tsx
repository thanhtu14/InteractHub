import { useEffect, useState } from "react";
import Friend from "./Friends";

interface FriendType {
  id: string | number;
  fullName: string;
  avatarUrl?: string;
}

// 🔥 Hàm bỏ dấu tiếng Việt
const removeVietnameseTones = (str: string) => {
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

  // 🔥 MOCK DATA (xóa khi có BE)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFriends([
        { id: 1, fullName: "Nguyễn Văn A", avatarUrl: "https://i.pravatar.cc/150?u=1" },
        { id: 2, fullName: "Trần Thị B", avatarUrl: "https://i.pravatar.cc/150?u=2" },
        { id: 3, fullName: "Lê Văn C", avatarUrl: "https://i.pravatar.cc/150?u=3" },
        { id: 4, fullName: "Phạm Minh D", avatarUrl: "https://i.pravatar.cc/150?u=4" },
        { id: 5, fullName: "Hoàng Thị E", avatarUrl: "https://i.pravatar.cc/150?u=5" },
        { id: 6, fullName: "Hoàng Thị F", avatarUrl: "https://i.pravatar.cc/150?u=6" },
        { id: 7, fullName: "Hoàng Thị G", avatarUrl: "https://i.pravatar.cc/150?u=7" },
        { id: 8, fullName: "Đặng Văn F", avatarUrl: "https://i.pravatar.cc/150?u=8" },
        { id: 9, fullName: "Bùi Gia Quang Vinh", avatarUrl: "https://i.pravatar.cc/150?u=vinh" },
      ]);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // 🔥 FILTER KHÔNG DẤU
  const filteredFriends = friends.filter((f) =>
    removeVietnameseTones(f.fullName).includes(
      removeVietnameseTones(keyword)
    )
  );

  return (
    <div className="flex flex-col h-full">

      {/* HEADER + SEARCH */}
      <div className="sticky top-0 z-10 flex-shrink-0 bg-[#18191a] px-4 pt-4 pb-3">

        {/* Title */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-semibold text-gray-400 uppercase tracking-wider">
            Bạn bè
          </h2>

          {!loading && (
            <span className="text-[12px] text-gray-500 font-medium">
              {friends.length} trực tuyến
            </span>
          )}
        </div>

        {/* 🔍 Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm bạn bè..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-3 py-2 pl-9 rounded-lg bg-[#242526]
                       text-sm text-white placeholder-gray-400
                       outline-none border border-transparent
                       focus:border-blue-500 transition"
          />

          {/* Icon */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔍
          </span>
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 pb-4">

        {/* Loading */}
        {loading && (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2
                            border-blue-600 border-t-transparent" />
          </div>
        )}

        {/* Empty */}
        {!loading && filteredFriends.length === 0 && (
          <div className="py-10 text-center px-4">
            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full
                            flex items-center justify-center mb-4 text-2xl">
              🔍
            </div>
            <p className="text-gray-400 text-sm">
              Không tìm thấy bạn bè
            </p>
          </div>
        )}

        {/* List */}
        {!loading && filteredFriends.length > 0 && (
          <div className="space-y-1">
            {filteredFriends.map((friend) => (
              <Friend key={friend.id} friend={friend} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendList;