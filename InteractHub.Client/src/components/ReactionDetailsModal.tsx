import React, { useState, useEffect } from "react";
import { likeService, type LikeSummary, type LikeUserDetails } from "../services/likeService";

const REACTIONS = [
  { key: "like",  emoji: "👍", label: "Thích" },
  { key: "love",  emoji: "❤️", label: "Yêu thích" },
  { key: "haha",  emoji: "😆", label: "Haha" },
  { key: "wow",   emoji: "😮", label: "Wow" },
  { key: "sad",   emoji: "😢", label: "Buồn" },
  { key: "angry", emoji: "😡", label: "Phẫn nộ" },
];

interface ReactionModalProps {
  postId: number;
  summary: LikeSummary;
  onClose: () => void;
  resolveUrl: (path?: string | null) => string;
}

const ReactionModal = ({ postId, summary, onClose, resolveUrl }: ReactionModalProps) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [users, setUsers] = useState<LikeUserDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    const fetchDetails = async () => {
        try {
            const data = await likeService.getDetails(postId, activeTab);
            if (!cancelled) {
                setUsers(data || []);
            }
        } catch (err) {
            console.error("Lỗi API:", err);
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    };

    setLoading(true); // ✅ vẫn set loading nhưng trước khi gọi async
    fetchDetails();

    return () => {
        cancelled = true; // cleanup tránh update state khi unmount
    };
}, [postId, activeTab]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#242526] w-full max-lg rounded-2xl border border-[#3e4042] shadow-2xl flex flex-col max-h-[80vh] sm:max-w-[500px]"
        onClick={e => e.stopPropagation()}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-[#3e4042]">
          <h3 className="text-white font-bold text-lg">Người đã bày tỏ cảm xúc</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:bg-[#3a3b3c] w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#3e4042] px-2 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-3 text-sm font-semibold border-b-4 transition-all whitespace-nowrap 
              ${activeTab === "all" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-400 hover:bg-[#3a3b3c]"}`}
          >
            Tất cả {summary.Total}
          </button>

          {summary.Breakdown && Object.entries(summary.Breakdown).map(([type, count]) => {
            if (!count) return null;
            const reactionInfo = REACTIONS.find(r => r.key === type.toLowerCase());
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-4 transition-all whitespace-nowrap
                  ${activeTab === type ? "border-blue-500 text-blue-500" : "border-transparent text-gray-400 hover:bg-[#3a3b3c]"}`}
              >
                <span className="text-xl">{reactionInfo?.emoji}</span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        {/* DANH SÁCH USER */}
        <div className="overflow-y-auto flex-1 p-2 min-h-[350px] custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Đang tải...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-1">
              {users.map((user) => (
                <div
                  key={user.UserId}
                  className="flex items-center justify-between p-2.5 hover:bg-[#3a3b3c] rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.Avatar ? resolveUrl(user.Avatar) : "/assets/img/icons8-user-default-64.png"}
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-[#3e4042]"
                        alt={user.FullName}
                        onError={(e) => (e.currentTarget.src = "/assets/img/icons8-user-default-64.png")}
                      />
                      <div className="absolute -bottom-1 -right-1 bg-[#242526] rounded-full p-0.5 shadow-lg border border-[#3e4042]">
                        <span className="text-[14px] leading-none block">
                          {REACTIONS.find(r => r.key === user.Type?.toLowerCase())?.emoji || "👍"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-white font-medium text-[16px]">{user.FullName}</span>
                    </div>
                  </div>

                  <button className="bg-[#3a3b3c] hover:bg-[#4e4f50] text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors active:scale-95">
                    Trang cá nhân
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <span className="text-4xl mb-2">🏜️</span>
              <p>Chưa có ai bày tỏ cảm xúc này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReactionModal;