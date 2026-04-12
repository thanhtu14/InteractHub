import React from "react";
import { FaFilter, FaTh } from "react-icons/fa";

export type SortOrder = "newest" | "oldest";
export type StatusFilter = "all" | "1" | "2" | "3";

interface PostFilterBarProps {
  sort: SortOrder;
  status: StatusFilter;
  onSortChange: (sort: SortOrder) => void;
  onStatusChange: (status: StatusFilter) => void;
  onManageClick: () => void;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string; emoji: string }[] = [
  { value: "all", label: "Tất cả",     emoji: "🌐" },
  { value: "1",   label: "Công khai",  emoji: "🌍" },
  { value: "2",   label: "Bạn bè",     emoji: "👥" },
  { value: "3",   label: "Riêng tư",   emoji: "🔒" },
];

const PostFilterBar: React.FC<PostFilterBarProps> = ({
  sort,
  status,
  onSortChange,
  onStatusChange,
  onManageClick,
}) => {
  return (
    <div className="bg-[#242526] p-4 rounded-xl border border-[#3e4042] shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white">Bài viết</h3>
        <button
          onClick={onManageClick}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#3a3b3c] hover:bg-[#4e4f50]
                     text-white text-sm rounded-lg transition-colors"
        >
          <FaTh size={13} />
          Quản lý bài viết
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Bộ lọc trạng thái */}
        <div className="flex items-center gap-1 bg-[#3a3b3c] rounded-lg p-1">
          <FaFilter size={12} className="text-gray-400 ml-1" />
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStatusChange(opt.value)}
              className={`px-3 py-1 rounded-md text-sm transition-colors
                ${status === opt.value
                  ? "bg-[#1877f2] text-white"
                  : "text-gray-300 hover:bg-[#4e4f50]"
                }`}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>

        {/* Sắp xếp */}
        <div className="flex items-center gap-1 bg-[#3a3b3c] rounded-lg p-1">
          {(["newest", "oldest"] as SortOrder[]).map((s) => (
            <button
              key={s}
              onClick={() => onSortChange(s)}
              className={`px-3 py-1 rounded-md text-sm transition-colors
                ${sort === s
                  ? "bg-[#1877f2] text-white"
                  : "text-gray-300 hover:bg-[#4e4f50]"
                }`}
            >
              {s === "newest" ? "🕐 Mới nhất" : "🕰️ Cũ nhất"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostFilterBar;