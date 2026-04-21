///abc

import React, { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaUserFriends,
  FaSearch,
  FaHome,
  FaFacebookMessenger,
  FaHouseUser,
  FaHistory,
  FaTimes,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { notificationService } from "../services/notificationService";

interface User {
  Id: string;
  Username: string;
  FullName?: string;
  ProfilePicture?: string;
  Email?: string;
}

interface NavbarProps {
  user?: User | null;
  onChatClick?: () => void;
  onNotifyClick?: () => void;
}

const HISTORY_KEY = "interact_hub_search_history";
const MAX_HISTORY = 8;

const getHistory = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveHistory = (keyword: string) => {
  const prev = getHistory().filter((k) => k !== keyword);
  const next = [keyword, ...prev].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
};

const removeHistoryItem = (keyword: string) => {
  const next = getHistory().filter((k) => k !== keyword);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
};

const clearHistory = () => localStorage.removeItem(HISTORY_KEY);

const Navbar: React.FC<NavbarProps> = ({ user: propUser, onChatClick, onNotifyClick }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [history, setHistory] = useState<string[]>(getHistory());
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync ô search với URL khi navigate sang /search?q=...
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (location.pathname === "/search" && q) {
      setSearch(q);
      setShowDropdown(false);
    } else if (location.pathname !== "/search") {
      setSearch("");
    }
  }, [location]);

  const currentUser: User | null =
    propUser || JSON.parse(localStorage.getItem("interact_hub_user") || "null");

  const displayName = (
    currentUser?.FullName || currentUser?.Username || "Người dùng"
  ).trim();

  const avatarSrc = currentUser?.ProfilePicture || "/images/default-avatar.png";

  // Fetch unread notification count
  useEffect(() => {
    notificationService
      .getUnreadCount()
      .then((res) => setUnreadCount(res.data ?? 0))
      .catch(() => setUnreadCount(0));
  }, []);

  // Click outside → close dropdown
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

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDropdown(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch search results
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setResults([]);
      return;
    }
    const fetchData = async () => {
      setLoadingSearch(true);
      try {
        const res = await axios.get("https://localhost:7069/api/users/search", {
          params: { keyword: debouncedSearch, currentUserId: currentUser?.Id },
        });
        setResults(res.data.data || []);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setLoadingSearch(false);
      }
    };
    fetchData();
  }, [debouncedSearch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (!e.target.value.trim()) setShowDropdown(true); // show history when empty
  };

  const handleFocus = () => setShowDropdown(true);

  const goToProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
    setShowDropdown(false);
    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      commitSearch(search.trim());
    }
  };

  const commitSearch = (keyword: string) => {
    saveHistory(keyword);
    setHistory(getHistory());
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
    setShowDropdown(false);
  };

  const handleHistoryClick = (keyword: string) => {
    setSearch(keyword);
    commitSearch(keyword);
  };

  const handleRemoveHistory = (e: React.MouseEvent, keyword: string) => {
    e.stopPropagation();
    removeHistoryItem(keyword);
    setHistory(getHistory());
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearHistory();
    setHistory([]);
  };

  const handleLogout = () => {
    localStorage.removeItem("interact_hub_user");
    localStorage.removeItem("interact_hub_token");
    navigate("/login");
  };

  const handleNotifyClick = () => {
    setUnreadCount(0);
    onNotifyClick?.();
  };

  const highlight = (text: string, keyword: string) => {
    if (!keyword) return text;
    const safe = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${safe})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <span key={i} className="text-[#1877f2] font-semibold">{part}</span>
      ) : (
        part
      )
    );
  };

  const showingHistory = !search.trim();
  const filteredHistory = history.filter((h) =>
    search ? h.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <nav className="bg-[#242526] border-b border-[#3e4042] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 h-20 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <Link to="/homepage" className="flex items-center gap-2 group">
            <div className="bg-[#1877f2] p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <span className="text-white font-black text-xl italic">IH</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-white hidden lg:block">
              Interact<span className="text-[#1877f2]">Hub</span>
            </span>
          </Link>

          {/* Search box */}
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
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              className="w-full bg-[#3a3b3c] text-white pl-11 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1877f2] text-sm"
            />

            {/* Dropdown */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute top-[115%] left-0 w-full bg-[#242526] border border-[#3e4042] rounded-xl shadow-2xl max-h-[420px] overflow-y-auto py-2"
              >
                {/* Loading */}
                {loadingSearch && (
                  <div className="px-4 py-4 text-center text-gray-400 text-sm">
                    Đang tìm...
                  </div>
                )}

                {/* Search results */}
                {!loadingSearch && !showingHistory && results.length > 0 && (
                  <>
                    {/* "Xem tất cả" link */}
                    <div
                      onClick={() => commitSearch(search)}
                      className="px-4 py-2.5 hover:bg-[#3a3b3c] flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center flex-shrink-0">
                        <FaSearch size={13} className="text-gray-300" />
                      </div>
                      <p className="text-white text-sm">
                        Tìm kiếm "<span className="font-semibold text-[#1877f2]">{search}</span>"
                      </p>
                    </div>
                    <div className="border-t border-[#3e4042] mx-3 my-1" />
                    {results.map((u) => (
                      <div
                        key={u.Id}
                        onClick={() => goToProfile(u.Id)}
                        className="px-4 py-2.5 hover:bg-[#3a3b3c] flex items-center gap-3 cursor-pointer transition-colors"
                      >
                        <img
                          src={u.ProfilePicture
                            ? `https://localhost:7069${u.ProfilePicture}`
                            : "/images/default-avatar.png"} alt=""
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="font-medium text-white text-sm leading-tight">
                            {highlight(u.FullName || u.Username, search)}
                          </p>
                          <p className="text-xs text-gray-400">@{u.Username}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* No results */}
                {!loadingSearch && !showingHistory && results.length === 0 && debouncedSearch && (
                  <div
                    onClick={() => commitSearch(search)}
                    className="px-4 py-2.5 hover:bg-[#3a3b3c] flex items-center gap-3 cursor-pointer transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center flex-shrink-0">
                      <FaSearch size={13} className="text-gray-300" />
                    </div>
                    <p className="text-white text-sm">
                      Tìm kiếm "<span className="font-semibold text-[#1877f2]">{search}</span>"
                    </p>
                  </div>
                )}

                {/* Search history */}
                {showingHistory && filteredHistory.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-4 py-1.5">
                      <span className="text-white text-sm font-semibold">Tìm kiếm gần đây</span>
                      <button
                        onClick={handleClearHistory}
                        className="text-[#1877f2] text-xs hover:underline"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                    {filteredHistory.map((keyword) => (
                      <div
                        key={keyword}
                        onClick={() => handleHistoryClick(keyword)}
                        className="px-4 py-2.5 hover:bg-[#3a3b3c] flex items-center gap-3 cursor-pointer transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center flex-shrink-0">
                          <FaHistory size={13} className="text-gray-400" />
                        </div>
                        <span className="text-white text-sm flex-1">{keyword}</span>
                        <button
                          onClick={(e) => handleRemoveHistory(e, keyword)}
                          className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-[#4a4b4c]"
                        >
                          <FaTimes size={11} />
                        </button>
                      </div>
                    ))}
                  </>
                )}

                {/* Empty history */}
                {showingHistory && filteredHistory.length === 0 && (
                  <div className="px-4 py-4 text-center text-gray-400 text-sm">
                    Chưa có tìm kiếm nào
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER */}
        <div className="hidden sm:flex items-center gap-1 md:gap-4">
          <NavIcon icon={<FaHome />} to="/homepage" />
          <NavIcon icon={<FaUserFriends />} to="/friendpage" />
          <NavIcon icon={<FaHouseUser />} to="/myprofile" />
          <NavIcon icon={<FaFacebookMessenger />} onClick={onChatClick} />

          {/* Bell with badge */}
          <div className="relative">
            <NavIcon icon={<FaBell />} onClick={handleNotifyClick} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none pointer-events-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          <Link
            to="/myprofile"
            className="flex items-center gap-2.5 group p-1 pr-3 rounded-full hover:bg-white/5 transition-all"
          >
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

const NavIcon = ({
  icon,
  to,
  onClick,
}: {
  icon: React.ReactNode;
  to?: string;
  onClick?: () => void;
}) => {
  const content = (
    <div className="p-2.5 md:p-3 hover:bg-[#3a3b3c] rounded-xl cursor-pointer text-gray-400 hover:text-[#1877f2] transition-all text-3xl md:text-3xl">
      {icon}
    </div>
  );
  if (to) return <Link to={to}>{content}</Link>;
  return <div onClick={onClick}>{content}</div>;
};

export default Navbar;
