import { useState, useRef } from "react";
import CommentSection from "./CommentSection";

interface PostProps {
  post: {
    id: string | number;
    fullName: string;
    avatarUrl?: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
  };
}

const REACTIONS = [
  { key: "like",  emoji: "👍", label: "Thích",     color: "text-[#1877f2]" },
  { key: "love",  emoji: "❤️",  label: "Yêu thích", color: "text-[#f33e58]" },
  { key: "haha",  emoji: "😆", label: "Haha",      color: "text-[#f7b125]" },
  { key: "wow",   emoji: "😮", label: "Wow",       color: "text-[#f7b125]" },
  { key: "sad",   emoji: "😢", label: "Buồn",      color: "text-[#f7b125]" },
  { key: "angry", emoji: "😡", label: "Phẫn nộ",   color: "text-[#e9710f]" },
];

type ReactionKey = typeof REACTIONS[number]["key"] | null;

const Post = ({ post }: PostProps) => {
  const [reaction, setReaction] = useState<ReactionKey>(null);
  const [reactionCount, setReactionCount] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentReaction = REACTIONS.find((r) => r.key === reaction);

  // Hover vào nút → hiện picker sau 400ms
  const handleMouseEnterBtn = () => {
    hoverTimeout.current = setTimeout(() => setShowPicker(true), 400);
  };

  const handleMouseLeaveBtn = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setShowPicker(false), 300);
  };

  const handleMouseEnterPicker = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setShowPicker(true);
  };

  const handleMouseLeavePicker = () => {
    hoverTimeout.current = setTimeout(() => setShowPicker(false), 300);
  };

  // Chọn reaction từ picker
  const handleSelectReaction = (key: string) => {
    if (reaction === key) {
      // Bỏ reaction
      setReaction(null);
      setReactionCount((prev) => prev - 1);
    } else {
      if (!reaction) setReactionCount((prev) => prev + 1);
      setReaction(key);
    }
    setShowPicker(false);
  };

  // Click nhanh → toggle like
  const handleClickLikeBtn = () => {
    if (reaction === "like") {
      setReaction(null);
      setReactionCount((prev) => prev - 1);
    } else {
      if (!reaction) setReactionCount((prev) => prev + 1);
      setReaction("like");
    }
  };

  return (
    <div className="bg-[#242526] border border-[#3e4042] rounded-3xl shadow-xl mb-6 overflow-hidden">

      {/* Post Header */}
      <div className="flex items-center gap-3 p-4">
        <img
          src={
            post.avatarUrl
              // ? `http://localhost:8080/uploads/${post.avatarUrl}`
              ? `data:image/jpeg;base64,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`
              : "/assets/img/icons8-user-default-64.png"
          }
          alt={post.fullName}
          className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-700"
          onError={(e) => (e.currentTarget.src = "/assets/img/icons8-user-default-64.png")}
        />
        <div>
          <p className="font-semibold text-white text-[17px]">{post.fullName}</p>
          <p className="text-gray-400 text-sm">
            {new Date(post.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3 text-[17px] text-gray-200 leading-relaxed">
        {post.content}
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="px-4 pb-4">
          <img
            src={`http://localhost:8080/uploads/${post.imageUrl}`}
            alt="Post content"
            className="w-full rounded-2xl object-cover max-h-[550px]"
          />
        </div>
      )}

      {/* Reaction Count */}
      {reactionCount > 0 && (
        <div className="px-4 py-2 border-t border-[#3e4042] text-gray-400 text-sm">
          {reactionCount} lượt cảm xúc
        </div>
      )}

      {/* Post Actions */}
      <div className="flex border-t border-[#3e4042] divide-x divide-[#3e4042]">

        {/* REACTION BUTTON + PICKER */}
        <div className="flex-1 relative">

          {/* Picker popup */}
          {showPicker && (
            <div
              onMouseEnter={handleMouseEnterPicker}
              onMouseLeave={handleMouseLeavePicker}
              className="absolute bottom-[110%] left-2 z-50
                         bg-[#3a3b3c] border border-[#4e4f50]
                         rounded-full px-3 py-2 flex gap-2 shadow-2xl
                         animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleSelectReaction(r.key)}
                  title={r.label}
                  className="group flex flex-col items-center transition-transform
                             hover:scale-125 active:scale-110 duration-150"
                >
                  <span className="text-2xl leading-none">{r.emoji}</span>
                  <span className="text-[10px] text-gray-300 mt-0.5 opacity-0
                                   group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleClickLikeBtn}
            onMouseEnter={handleMouseEnterBtn}
            onMouseLeave={handleMouseLeaveBtn}
            className={`w-full py-4 flex items-center justify-center gap-2 text-[15px]
              font-medium transition-all hover:bg-[#3a3b3c]
              ${currentReaction ? currentReaction.color + " font-semibold" : "text-gray-300"}`}
          >
            <span className="text-lg leading-none">
              {currentReaction ? currentReaction.emoji : "👍"}
            </span>
            <span>{currentReaction ? currentReaction.label : "Thích"}</span>
          </button>
        </div>

        {/* COMMENT BUTTON */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-4 flex items-center justify-center gap-2 text-[15px]
                     font-medium text-gray-300 hover:bg-[#3a3b3c] transition-all"
        >
          💬 Bình luận
        </button>

        {/* SHARE BUTTON */}
        <button className="flex-1 py-4 flex items-center justify-center gap-2 text-[15px]
                           font-medium text-gray-300 hover:bg-[#3a3b3c] transition-all">
          🔗 Chia sẻ
        </button>
      </div>

      {/* Comment Section — dùng component có sẵn */}
      {showComments && (
        <div className="border-t border-[#3e4042]">
          <CommentSection
            postId={post.id}
            onClose={() => setShowComments(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Post;