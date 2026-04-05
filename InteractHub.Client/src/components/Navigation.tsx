import { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaUserFriends,
  FaSearch,
  FaHome,
  FaFacebookMessenger,
  FaHouseUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface User {
  id: string | number;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
}

interface NavbarProps {
  user?: User | null;
  onChatClick?: () => void;
  onNotifyClick?: () => void;
}

const Navbar = ({ user: propUser, onChatClick, onNotifyClick }: NavbarProps) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = propUser || JSON.parse(localStorage.getItem("user") || "{}");

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoadingSearch(true);
    try {
      const res = await axios.get("http://localhost:8080/auth/search", {
        params: {
          keyword: value,
          currentUserId: currentUser.id,
        },
      });
      setResults(res.data || []);
      setShowDropdown(true);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSendFriendRequest = async (receiverId: string | number) => {
    try {
      await axios.post("http://localhost:8080/api/friends/request", null, {
        params: {
          senderId: currentUser.id,
          receiverId,
        },
      });
      alert("Đã gửi lời mời kết bạn thành công!");
    } catch (err) {
      console.error(err);
      alert("Không thể gửi lời mời kết bạn!");
    }
  };

  const goToProfile = (userId: string | number) => {
    navigate(`/profile/${userId}`);
    setShowDropdown(false);
    setSearch("");
  };

  return (
    <nav className="bg-[#242526] border-b border-[#3e4042] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* LEFT - Logo + Search */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate("/homepage")}
          >
            <div className="bg-[#1877f2] p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <span className="text-white font-black text-xl italic">IH</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white hidden md:block">
              Interact<span className="text-[#1877f2]">Hub</span>
            </span>
          </div>

          <div className="relative w-[320px]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
              <FaSearch size={18} />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm trên InteractHub"
              value={search}
              onChange={handleSearch}
              onFocus={() => search && setShowDropdown(true)}
              className="w-full bg-[#3a3b3c] text-white placeholder-gray-400
                         pl-12 pr-4 py-2.5 rounded-full focus:outline-none focus:ring-2
                         focus:ring-blue-500 text-[15px]"
            />

            {/* Search Dropdown */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute top-[110%] left-0 w-full bg-[#242526] border border-gray-700
                           rounded-2xl shadow-2xl max-h-[380px] overflow-y-auto py-2 z-50"
              >
                {loadingSearch ? (
                  <div className="px-4 py-6 text-center text-gray-400">
                    Đang tìm kiếm...
                  </div>
                ) : results.length > 0 ? (
                  results.map((u) => (
                    <div
                      key={u.id}
                      className="px-4 py-3 hover:bg-[#3a3b3c] flex items-center gap-3 cursor-pointer group"
                    >
                      <img
                        src={
                          u.avatarUrl
                            ? `http://localhost:8080/uploads/${u.avatarUrl}`
                            : "/assets/img/icons8-user-default-64.png"
                        }
                        alt={u.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                        onClick={() => goToProfile(u.id)}
                      />
                      <div
                        className="flex-1 text-white"
                        onClick={() => goToProfile(u.id)}
                      >
                        <p className="font-medium group-hover:text-blue-400 transition-colors">
                          {u.fullName}
                        </p>
                        {u.username && (
                          <p className="text-sm text-gray-400">@{u.username}</p>
                        )}
                      </div>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendFriendRequest(u.id);
                          }}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white
                                     text-sm font-medium rounded-xl transition-colors"
                        >
                          Kết bạn
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-400">
                    Không tìm thấy kết quả
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER - Navigation Icons */}
        <div className="flex items-center gap-2 md:gap-8">
          <div
            onClick={() => navigate("/homepage")}
            className="p-3 hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition-colors
                       text-3xl text-gray-300 hover:text-white"
          >
            <FaHome />
          </div>

          <div
            onClick={() => navigate("/friendpage")}
            className="p-3 hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition-colors
                       text-3xl text-gray-300 hover:text-white"
          >
            <FaUserFriends />
          </div>

          <div
            onClick={() => navigate("/profilepage")}
            className="p-3 hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition-colors
                       text-3xl text-gray-300 hover:text-white"
          >
            <FaHouseUser />
          </div>

          <div
            onClick={onChatClick}
            className="p-3 hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition-colors
                       text-3xl text-gray-300 hover:text-white"
          >
            <FaFacebookMessenger />
          </div>

          {/* ✅ Bell icon gọi onNotifyClick để chuyển sang tab thông báo */}
          <div
            onClick={onNotifyClick}
            className="p-3 hover:bg-[#3a3b3c] rounded-xl cursor-pointer transition-colors
                       text-3xl text-gray-300 hover:text-white"
          >
            <FaBell />
          </div>
        </div>

        {/* RIGHT - User Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 pl-4 border-l border-gray-700">
            <span className="text-white font-medium hidden md:block">
              {currentUser.fullName || currentUser.username || "Người dùng"}
            </span>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm
                         font-medium rounded-2xl transition-all"
            >
              Đăng xuất
            </button>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;