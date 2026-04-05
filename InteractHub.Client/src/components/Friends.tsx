import { FaMessage } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface FriendProps {
  friend: {
    id?: string | number;
    fullName: string;
    avatarUrl?: string;
  };
}

const Friend = ({ friend }: FriendProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="group flex items-center gap-4 p-4 bg-[#1a1a1a] hover:bg-[#242526]
                 rounded-2xl transition-all duration-300 cursor-pointer
                 border border-gray-800 hover:border-[#3e4042]"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={
            friend.avatarUrl
              ? `http://localhost:8080/uploads/${friend.avatarUrl}`
              : "/assets/img/icons8-user-default-64.png"
          }
          alt={friend.fullName}
          className="w-14 h-14 rounded-full object-cover ring-2 ring-transparent
                     group-hover:ring-logocolor transition-all duration-300"
        />
      </div>

      {/* Tên + trạng thái */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-[17px] truncate
                      group-hover:text-logocolor transition-colors">
          {friend.fullName}
        </p>
        <p className="text-gray-500 text-sm mt-0.5">Bạn bè</p>
      </div>

      {/* Các nút — chỉ hiện khi hover vào card */}
      <div className="flex items-center gap-2
                      opacity-0 group-hover:opacity-100
                      translate-x-2 group-hover:translate-x-0
                      transition-all duration-200">

        {/* Nút nhắn tin */}
        <button
          title={`Nhắn tin với ${friend.fullName}`}
          onClick={(e) => {
            e.stopPropagation();
            alert(`Nhắn tin với ${friend.fullName}`);
          }}
          className="w-9 h-9 flex items-center justify-center
                     bg-[#3a3b3c] hover:bg-logocolor text-white
                     rounded-xl transition-all duration-200 shadow-sm"
        >
          <FaMessage size={15} />
        </button>

        {/* Nút xem trang cá nhân */}
        <button
          title={`Xem trang cá nhân của ${friend.fullName}`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${friend.id}`);
          }}
          className="w-9 h-9 flex items-center justify-center
                     bg-[#3a3b3c] hover:bg-logocolor text-white
                     rounded-xl transition-all duration-200 shadow-sm"
        >
          <FaUser size={15} />
        </button>

      </div>
    </div>
  );
};

export default Friend;