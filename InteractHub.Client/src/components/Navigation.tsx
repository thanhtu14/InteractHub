import React, { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaUserFriends,
  FaSearch,
  FaHome,
  FaFacebookMessenger,
  FaHouseUser,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Định nghĩa Interface chuẩn theo Backend (PascalCase)
interface User {
  Id: string;
  Username: string;
  FullName?: string;
  AvatarUrl?: string;
  Email?: string;
}

interface NavbarProps {
  user?: User | null;
  onChatClick?: () => void;
  onNotifyClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user: propUser, onChatClick, onNotifyClick }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lấy User: Ưu tiên từ props truyền xuống, sau đó tới localStorage
  const currentUser: User | null = propUser || JSON.parse(localStorage.getItem("interact_hub_user") || "null");

  // Logic hiển thị tên (Lấy chữ cuối)
  const displayName = (() => {
    const name = currentUser?.FullName || currentUser?.Username || "Người dùng";
    return name.trim();
  })();

  // Logic hiển thị Avatar
  const avatarSrc = currentUser?.AvatarUrl || "/images/default-avatar.png";

  // Đóng dropdown tìm kiếm khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && !inputRef.current.contains(event.target as Node)
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
        params: { keyword: value, currentUserId: currentUser?.Id },
      });
      setResults(res.data || []);
      setShowDropdown(true);
    } catch (err) {
      console.error("Lỗi tìm kiếm:", err);
      setResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const goToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
    setShowDropdown(false);
    setSearch("");
  };

  const handleLogout = () => {
    localStorage.removeItem("interact_hub_user");
    localStorage.removeItem("interact_hub_token");
    navigate("/login");
  };

  return (
    <nav className="bg-[#242526] border-b border-[#3e4042] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 h-20 flex items-center justify-between">

        {/* LEFT - Logo & Search */}
        <div className="flex items-center gap-3 ">
          <Link to="/homepage" className="flex items-center gap-2 group">
            <div className="bg-[#1877f2] p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <span className="text-white font-black text-xl italic">IH</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white hidden lg:block">
              Interact<span className="text-[#1877f2]">Hub</span>
            </span>
          </Link>

          <div className="relative w-[240px] md:w-[320px]">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <FaSearch size={16} />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={handleSearch}
              onFocus={() => search && setShowDropdown(true)}
              className="w-full bg-[#3a3b3c] text-white pl-11 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-sm"
            />

            {showDropdown && (
              <div ref={dropdownRef} className="absolute top-[115%] left-0 w-full bg-[#242526] border border-[#3e4042] rounded-xl shadow-2xl max-h-[400px] overflow-y-auto py-2">
                {loadingSearch ? (
                  <div className="px-4 py-4 text-center text-gray-400 text-sm">Đang tìm...</div>
                ) : results.length > 0 ? (
                  results.map((u) => (
                    <div key={u.Id} onClick={() => goToProfile(u.Id)} className="px-4 py-3 hover:bg-[#3a3b3c] flex items-center gap-3 cursor-pointer transition-colors">
                      <img src={u.AvatarUrl || "/images/default-avatar.png"} alt="" className="w-15 h-15 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-white text-sm">{u.FullName || u.Username}</p>
                        <p className="text-xs text-gray-400">@{u.Username}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-4 text-center text-gray-400 text-sm">Không thấy kết quả</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER - Navigation */}
        <div className="hidden sm:flex items-center gap-1 md:gap-4">
          <NavIcon icon={<FaHome />} to="/homepage" />
          <NavIcon icon={<FaUserFriends />} to="/friendpage" />
          <NavIcon icon={<FaHouseUser />} to="/myprofile" />
          <NavIcon icon={<FaFacebookMessenger />} onClick={onChatClick} />
          <NavIcon icon={<FaBell />} onClick={onNotifyClick} />
        </div>

        {/* RIGHT - Profile & Logout */}
        <div className="flex items-center gap-3">
          <Link to="/myprofile" className="flex items-center gap-2.5 group p-1 pr-3 rounded-full hover:bg-white/5 transition-all">
            <img
              src={`https://localhost:7069${avatarSrc}`}
              alt="Me"
              className="w-12 h-12 md:w-11 md:h-11 rounded-full object-cover border border-gray-600 group-hover:border-[#1877f2]"
            />
            <span className="text-white text-[14px] font-semibold hidden sm:block group-hover:text-[#1877f2]">
              {displayName}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-4 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[13px] font-bold rounded-xl transition-all border border-red-600/20"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </nav>
  );
};

// Component con cho các Icon điều hướng để code gọn hơn
const NavIcon = ({ icon, to, onClick }: { icon: React.ReactNode; to?: string; onClick?: () => void }) => {
  const content = (
    <div className="p-2.5 md:p-3 hover:bg-[#3a3b3c] rounded-xl cursor-pointer text-gray-400 hover:text-[#1877f2] transition-all text-3xl md:text-3xl">
      {icon}
    </div>
  );

  if (to) return <Link to={to}>{content}</Link>;
  return <div onClick={onClick}>{content}</div>;
};

export default Navbar;