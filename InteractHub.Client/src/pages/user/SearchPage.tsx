import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserFriends, FaNewspaper, FaUserPlus, FaSearch, FaImage } from "react-icons/fa";
import Navbar from "../../components/Navigation";

const API = "https://localhost:7069/api";

interface User {
  Id: string;
  Username: string;
  FullName?: string;
  ProfilePicture?: string;
  MutualFriends?: number;
}

interface Post {
  Id: number;
  Content?: string;
  AuthorName: string;
  AuthorAvatar?: string;
  AuthorId: string;
  CreatedAt: string;
  LikeCount: number;
  CommentCount: number;
  MediaUrls: string[];
}

type FilterType = "all" | "people" | "posts";

const HISTORY_KEY = "interact_hub_search_history";

const saveHistory = (keyword: string) => {
  try {
    const prev: string[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const next = [keyword, ...prev.filter((k) => k !== keyword)].slice(0, 8);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {}
};

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const keyword = params.get("q") || "";

  const [filter, setFilter] = useState<FilterType>("all");
  const [people, setPeople] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("interact_hub_user") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!keyword.trim()) return;
    saveHistory(keyword);
    fetchAll(keyword);
  }, [keyword]);

  const fetchAll = async (q: string) => {
    setLoading(true);
    try {
      const [peopleRes, postsRes] = await Promise.allSettled([
        axios.get(`${API}/users/search`, {
          params: { keyword: q, currentUserId: currentUser?.Id },
        }),
        axios.get(`${API}/post/search`, {
          params: { keyword: q },
        }),
      ]);

      if (peopleRes.status === "fulfilled") {
        const data = peopleRes.value.data;
        setPeople(Array.isArray(data) ? data : data?.data ?? []);
      }
      if (postsRes.status === "fulfilled") {
        const data = postsRes.value.data;
        setPosts(Array.isArray(data) ? data : data?.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await axios.post(`${API}/friends/request`, {
        senderId: currentUser?.Id,
        receiverId: userId,
      });
    } catch {}
  };

  const filterButtons: { key: FilterType; label: string; icon: React.ReactNode }[] = [
    { key: "all",    label: "Tất cả",    icon: <FaSearch size={16} /> },
    { key: "people", label: "Mọi người", icon: <FaUserFriends size={16} /> },
    { key: "posts",  label: "Bài viết",  icon: <FaNewspaper size={16} /> },
  ];

  const showPeople = filter === "all" || filter === "people";
  const showPosts  = filter === "all" || filter === "posts";
  const isEmpty    = !loading && people.length === 0 && posts.length === 0 && !!keyword;

  return (
    <div className="min-h-screen bg-[#18191a] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-6 flex gap-6">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-[300px] flex-shrink-0">
          <div className="bg-[#242526] rounded-2xl p-4 sticky top-24 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-3">Bộ lọc kết quả</h2>
            <div className="flex flex-col gap-1">
              {filterButtons.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    filter === key
                      ? "bg-[#1877f2]/20 text-[#1877f2]"
                      : "text-gray-300 hover:bg-[#3a3b3c]"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    filter === key ? "bg-[#1877f2]" : "bg-[#3a3b3c]"
                  }`}>
                    <span className={filter === key ? "text-white" : "text-gray-400"}>
                      {icon}
                    </span>
                  </div>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 pb-10">

          <div className="mb-5">
            <p className="text-gray-400 text-sm">Kết quả tìm kiếm cho</p>
            <h1 className="text-2xl font-bold">"{keyword}"</h1>
          </div>

          {/* Skeleton */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[#242526] rounded-2xl p-5 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-[#3a3b3c]" />
                    <div className="flex-1">
                      <div className="h-4 bg-[#3a3b3c] rounded w-1/3 mb-2" />
                      <div className="h-3 bg-[#3a3b3c] rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && (
            <>
              {/* PEOPLE */}
              {showPeople && people.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                    <FaUserFriends className="text-[#1877f2]" />
                    Mọi người
                    <span className="text-gray-400 font-normal text-sm">({people.length})</span>
                  </h2>
                  <div className="flex flex-col gap-3">
                    {people.map((u) => (
                      <div key={u.Id} className="bg-[#242526] rounded-2xl p-4 flex items-center gap-4 hover:bg-[#2d2e2f] transition-colors">
                        <img
                          src={u.ProfilePicture ? `https://localhost:7069${u.ProfilePicture}` : "/images/default-avatar.png"}
                          alt=""
                          className="w-14 h-14 rounded-full object-cover border-2 border-[#3e4042] flex-shrink-0 cursor-pointer"
                          onClick={() => navigate(`/profile/${u.Id}`)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white cursor-pointer hover:underline truncate" onClick={() => navigate(`/profile/${u.Id}`)}>
                            {u.FullName || u.Username}
                          </p>
                          <p className="text-sm text-gray-400">@{u.Username}</p>
                          {!!u.MutualFriends && u.MutualFriends > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">{u.MutualFriends} bạn chung</p>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => navigate(`/profile/${u.Id}`)}
                            className="px-3 py-1.5 bg-[#3a3b3c] hover:bg-[#4a4b4c] text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            Xem trang cá nhân
                          </button>
                          {u.Id !== currentUser?.Id && (
                            <button
                              onClick={() => handleAddFriend(u.Id)}
                              className="px-3 py-1.5 bg-[#1877f2]/20 hover:bg-[#1877f2] text-[#1877f2] hover:text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5"
                            >
                              <FaUserPlus size={11} /> Thêm bạn
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* POSTS */}
              {showPosts && posts.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-base font-bold mb-3 flex items-center gap-2">
                    <FaNewspaper className="text-[#1877f2]" />
                    Bài viết
                    <span className="text-gray-400 font-normal text-sm">({posts.length})</span>
                  </h2>
                  <div className="flex flex-col gap-3">
                    {posts.map((p) => (
                      <div key={p.Id} className="bg-[#242526] rounded-2xl p-4 hover:bg-[#2d2e2f] transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={p.AuthorAvatar ? `https://localhost:7069${p.AuthorAvatar}` : "/images/default-avatar.png"}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover cursor-pointer flex-shrink-0"
                            onClick={() => navigate(`/profile/${p.AuthorId}`)}
                          />
                          <div>
                            <p className="font-semibold text-sm text-white hover:underline cursor-pointer" onClick={() => navigate(`/profile/${p.AuthorId}`)}>
                              {p.AuthorName}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(p.CreatedAt).toLocaleDateString("vi-VN", {
                                day: "2-digit", month: "2-digit", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>

                        {p.Content && (
                          <p className="text-sm text-gray-200 leading-relaxed line-clamp-4 mb-3">{p.Content}</p>
                        )}

                        {/* Media grid */}
                        {p.MediaUrls?.length > 0 && (
                          <div className={`grid gap-1 mb-3 rounded-xl overflow-hidden ${
                            p.MediaUrls.length === 1 ? "grid-cols-1" :
                            p.MediaUrls.length === 2 ? "grid-cols-2" : "grid-cols-3"
                          }`}>
                            {p.MediaUrls.slice(0, 3).map((url, idx) => (
                              <div key={idx} className="relative">
                                {url.match(/\.(mp4|webm|ogg)$/i) ? (
                                  <video src={`https://localhost:7069${url}`} className="w-full object-cover max-h-52" controls />
                                ) : (
                                  <img src={`https://localhost:7069${url}`} alt="" className="w-full object-cover max-h-52" />
                                )}
                                {idx === 2 && p.MediaUrls.length > 3 && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded">
                                    <span className="text-white text-xl font-bold">+{p.MediaUrls.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-[#3e4042] pt-2">
                          <span>👍 {p.LikeCount} lượt thích</span>
                          <span>💬 {p.CommentCount} bình luận</span>
                          {p.MediaUrls?.length > 0 && (
                            <span className="flex items-center gap-1"><FaImage size={11} /> {p.MediaUrls.length}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Empty */}
              {isEmpty && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#3a3b3c] flex items-center justify-center mb-4">
                    <FaSearch size={32} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Không tìm thấy kết quả</h3>
                  <p className="text-gray-400 text-sm max-w-xs">
                    Không có kết quả nào cho "{keyword}". Hãy thử từ khóa khác.
                  </p>
                </div>
              )}

              {!keyword && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#3a3b3c] flex items-center justify-center mb-4">
                    <FaSearch size={32} className="text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Tìm kiếm gì đó</h3>
                  <p className="text-gray-400 text-sm">Nhập từ khóa vào ô tìm kiếm bên trên.</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
