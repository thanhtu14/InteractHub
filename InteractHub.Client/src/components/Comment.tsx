import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { commentService, type CommentResponse } from "../services/commetService";
import {getTimeAgo} from "../utils/timeUtils"; // ✅ Tái sử dụng hàm định dạng thời gian chuẩn
import {resolveUrl} from "../utils/urlUtils"; // ✅ Tái sử dụng hàm định dạng thời gian chuẩn

interface CommentProps {
  comment: CommentResponse;
  postId: number;
  onReplyAdded?: (newComment: CommentResponse) => void;
  depth?: number;
  parentUserName?: string;
  highlighted?: boolean; // ✅ để highlight comment được navigate đến
}
const Comment: React.FC<CommentProps> = ({
  comment,
  postId,
  onReplyAdded,
  depth = 0,
  parentUserName,
  highlighted = false,
}) => {
  const [isLiked, setIsLiked] = useState(comment.IsLikedByCurrentUser);
  const [likeCount, setLikeCount] = useState(comment.LikeCount);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replies, setReplies] = useState<CommentResponse[]>(comment.Replies || []);
  const [showReplies, setShowReplies] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(highlighted);
  const navigate = useNavigate();
  const commentRef = useRef<HTMLDivElement>(null);

  // 1. Tự động bung replies nếu URL chứa ID của comment con
  useEffect(() => {
    const hash = window.location.hash;
    const targetId = parseInt(hash.replace("#comment-", ""));

    // Nếu comment hiện tại có con trùng với ID trên URL -> Mở danh sách con
    if (comment.Replies?.some(r => r.Id === targetId)) {
      setShowReplies(true);
    }

    // Nếu ID comment này chính là cái được nhắc tới trên URL -> Bật sáng
    if (hash === `#comment-${comment.Id}`) {
      setIsHighlighted(true);
    }
  }, [comment.Id, comment.Replies]);

  // 2. Tự động cuộn tới và tạo hiệu ứng sáng rực
  useEffect(() => {
    if (isHighlighted && commentRef.current) {
      // Đợi 400ms để danh sách kịp bung ra rồi mới scroll
      setTimeout(() => {
        commentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);

      // Sau 4 giây thì tắt màu highlight
      // const colorTimer = setTimeout(() => setIsHighlighted(false), 4000);
      // return () => {
      //   clearTimeout(timer);
      //   clearTimeout(colorTimer);
      // };
    }
  }, [isHighlighted]);

  const handleToggleLike = async () => {
    try {
      const data = await commentService.toggleLike(comment.Id);
      if (data) {
        setIsLiked(data.IsLiked);
        setLikeCount(data.LikeCount);
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
      const data = await commentService.create({
        PostId: postId,
        Content: replyContent.trim(),
        ParentId: comment.Id,
      });
      if (data) {
        if (depth === 0) {
          setReplies(prev => [...prev, data]);
          setShowReplies(true);
        }
        onReplyAdded?.(data);
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
    <div
      id={`comment-${comment.Id}`}
      ref={commentRef}
      className={`flex gap-3 ${isTopLevel ? "mt-5" : "mt-3"} rounded-xl transition-all duration-1000
        ${isHighlighted
          ? "bg-[#2d3f57] ring-2 ring-[#1877f2] p-3 shadow-[0_0_20px_rgba(24,119,242,0.4)]"
          : "p-1"}`}
    >
      <div className="flex-shrink-0">
        <img
          src={resolveUrl(comment.UserAvatar) || "/assets/img/icons8-user-default-64.png"}
          className={`${isTopLevel ? "w-10 h-10" : "w-8 h-8"} rounded-full object-cover border border-gray-600 shadow-sm`}
          alt={comment.UserName}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-[#3a3b3c] rounded-2xl px-4 py-2.5 w-fit max-w-[95%] shadow-md">
          <p
            onClick={() => navigate(`/profile/${comment.UserId}`)}
            className="text-white text-[14px] font-semibold hover:underline cursor-pointer mb-0.5"
          >
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
          <span className="font-normal opacity-70 cursor-default">
            {getTimeAgo(comment.CreatedAt)}
          </span>
        </div>

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

        {isTopLevel && replies.length > 0 && (
          <div className="mt-2 ml-2">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-gray-400 text-[13px] font-bold hover:underline flex items-center gap-2"
            >
              <span className="w-6 h-[1px] bg-gray-600 inline-block" />
              {showReplies ? "Ẩn bớt phản hồi" : `Xem tất cả ${replies.length} phản hồi`}
            </button>
          </div>
        )}

        {isTopLevel && showReplies && replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l-[3px] border-[#4e4f50] ml-1 pl-4">
            {replies.map((reply) => (
              <Comment
                key={reply.Id}
                comment={reply}
                postId={postId}
                depth={1}
                parentUserName={reply.ParentUserName}
                // Quan trọng: Truyền highlighted cho con nếu hash URL khớp với ID của nó
                highlighted={window.location.hash === `#comment-${reply.Id}`}
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