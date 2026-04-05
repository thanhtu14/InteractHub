import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Friend {
  id: string | number;
  username: string;
  avatarUrl?: string;
  fullName?: string;
}

interface ListFriendsByIDProps {
  userId: string | number;
}

const ListFriendsByID = ({ userId }: ListFriendsByIDProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:8080/api/friends/${userId}`)
      .then((res) => {
        setFriends(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Không thể lấy danh sách bạn bè", err);
        setFriends([]);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleClickFriend = (friendId: string | number) => {
    navigate(`/profile/${friendId}`);
  };

  return (
    <div className="mt-8">
      {/* Title */}
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        Danh sách bạn bè
        {friends.length > 0 && (
          <span className="text-sm font-normal text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
            {friends.length} người
          </span>
        )}
      </h3>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && friends.length === 0 && (
        <div className="bg-[#242526] border border-gray-700 rounded-3xl py-16 text-center">
          <div className="mx-auto w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-5xl mb-4">
            👥
          </div>
          <p className="text-gray-400 text-lg">Chưa có bạn bè nào</p>
        </div>
      )}

      {/* Danh sách bạn bè - Grid */}
      {!loading && friends.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {friends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => handleClickFriend(friend.id)}
              className="group bg-[#242526] border border-gray-700 hover:border-blue-500 
                         rounded-3xl p-5 flex flex-col items-center text-center 
                         transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
            >
              {/* Avatar */}
              <div className="relative mb-4">
                <img
                  src={
                    friend.avatarUrl
                      ? `http://localhost:8080/uploads/${friend.avatarUrl}`
                      : "/assets/img/icons8-user-default-64.png"
                  }
                  alt={friend.username || friend.fullName}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-800 
                             group-hover:ring-blue-500 transition-all duration-300"
                />
              </div>

              {/* Name */}
              <p className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors line-clamp-1">
                {friend.fullName || friend.username}
              </p>
              
              {friend.username && friend.username !== friend.fullName && (
                <p className="text-gray-500 text-sm mt-1">@{friend.username}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListFriendsByID;