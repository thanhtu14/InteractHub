import React, { useState, useEffect } from "react";
import { commentService, type CommentResponse } from "../services/commetService";

interface CommentProps {
  comment: CommentResponse;
  postId: number;
  onReplyAdded?: (newComment: CommentResponse) => void;
  depth?: number;
  parentUserName?: string;
}
const getTimeAgo = (dateString?: string | null): string => {
  if (!dateString) return "";

  // Chuẩn hóa format từ DB (ví dụ: "2026-04-11 09:13:26") sang chuẩn ISO
  const normalizedDate = dateString.replace(" ", "T") + "Z";
  const now = new Date();
  const past = new Date(normalizedDate);

  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return "vừa xong";

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} phút`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} giờ`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ngày`;

  return `${Math.floor(diffInDays / 7)} tuần`;
};

const SERVER_BASE_URL = "https://localhost:7069";

const resolveUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${SERVER_BASE_URL}${path}`;
};

const Comment: React.FC<CommentProps> = ({ comment, postId, onReplyAdded, depth = 0, parentUserName }) => {
  const [isLiked, setIsLiked] = useState(comment.IsLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(comment.LikeCount);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replies, setReplies] = useState<CommentResponse[]>(comment.Replies || []);
  const [showReplies, setShowReplies] = useState(false);

  useEffect(() => {
    setIsLiked(comment.IsLikedByCurrentUser);
    setLikeCount(comment.LikeCount);
    setReplies(comment.Replies || []);
  }, [comment]);

  const handleToggleLike = async () => {
    try {
      const res = await commentService.toggleLike(comment.Id);
      if (res.Success && res.Data) {
        setIsLiked(res.Data.IsLiked);
        setLikeCount(res.Data.LikeCount);
      }
    } catch (err) {
      console.error("Lỗi khi Like:", err);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await commentService.create({
        PostId: postId,
        Content: replyContent.trim(),
        ParentId: comment.Id,
      });

      if (res.Success && res.Data) {
        if (depth === 0) {
          setReplies(prev => [...prev, res.Data!]);
          setShowReplies(true);
        }
        onReplyAdded?.(res.Data!);
        setReplyContent("");
        setShowReplyInput(false);
      }
    } catch (err) {
      console.error("Reply failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTopLevel = depth === 0;

  return (
    <div className={`flex gap-3 ${isTopLevel ? "mt-5" : "mt-3"}`}>
      {/* Avatar - Tăng size lên 40px cho cấp 1 và 32px cho cấp 2 */}
      <div className="flex-shrink-0">
        <img
          src={resolveUrl(comment.UserAvatar) || "/assets/img/icons8-user-default-64.png"}
          className={`${isTopLevel ? "w-10 h-10" : "w-8 h-8"} rounded-full object-cover border border-gray-600 shadow-sm`}
          alt={comment.UserName}
        />
      </div>

      <div className="flex-1 min-w-0">
        {/* Bong bóng bình luận - Tăng padding và text size */}
        <div className="bg-[#3a3b3c] rounded-2xl px-4 py-2.5 w-fit max-w-[95%] shadow-md">
          <p className="text-white text-[14px] font-semibold hover:underline cursor-pointer mb-0.5">
            {comment.UserName}
          </p>
          <p className="text-gray-100 text-[15px] leading-relaxed break-words">
            {!isTopLevel && parentUserName && (
              <span className="text-blue-400 font-bold mr-1.5 cursor-pointer hover:underline">
                @{parentUserName}
              </span>
            )}
            {comment.Content}
          </p>
        </div>

        {/* Actions - Cập nhật phần hiển thị thời gian */}
        <div className="flex items-center gap-5 mt-1.5 ml-2 text-[12px] font-bold text-gray-400">
          <button
            onClick={handleToggleLike}
            className={`hover:underline transition-all ${isLiked ? "text-[#1877f2] scale-105" : ""}`}
          >
            Thích {likeCount > 0 ? likeCount : ""}
          </button>

          <button onClick={() => setShowReplyInput(!showReplyInput)} className="hover:underline">
            Phản hồi
          </button>

          {/* ✅ HIỂN THỊ THỜI GIAN THỰC TỪ DATA */}
          <span className="font-normal opacity-70 cursor-default">
            {getTimeAgo(comment.CreatedAt)}
          </span>
        </div>

        {/* Input trả lời - Tăng chiều cao input */}
        {showReplyInput && (
          <form onSubmit={handleReplySubmit} className="mt-3 flex gap-2">
            <input
              autoFocus
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Trả lời ${comment.UserName}...`}
              className="flex-1 bg-[#3a3b3c] text-white text-[14px] px-4 py-2 rounded-full outline-none focus:ring-2 ring-[#1877f2] transition-all"
            />
          </form>
        )}

        {/* Nút xem phản hồi - Tăng kích thước */}
        {isTopLevel && replies.length > 0 && (
          <div className="mt-2 ml-2">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-gray-400 text-[13px] font-bold hover:underline flex items-center gap-2"
            >
              <span className="w-6 h-[1px] bg-gray-600 inline-block"></span>
              {showReplies ? "Ẩn bớt phản hồi" : `Xem tất cả ${replies.length} phản hồi`}
            </button>
          </div>
        )}

        {/* Render Replies - Tăng border-left để phân tách rõ hơn */}
        {isTopLevel && showReplies && replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l-[3px] border-[#4e4f50] ml-1 pl-4">
            {replies.map((reply) => (
              <Comment
                key={reply.Id}
                comment={reply}
                postId={postId}
                depth={1}
                parentUserName={reply.ParentUserName}
                onReplyAdded={(newReply) => {
                  if (!replies.find(r => r.Id === newReply.Id)) {
                    setReplies(prev => [...prev, newReply]);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;