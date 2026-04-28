import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Comment from "./Comment";
import { commentService, type CommentResponse } from "../services/commetService";
import { resolveUrl } from "../utils/urlUtils";

interface CommentSectionProps {
  postId: number;
  authorId: string | undefined; // ✅ thêm prop authorId
  post: any;
  onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, authorId, post, onClose }) => {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const highlightedCommentId = location.hash.startsWith("#comment-")
    ? Number(location.hash.replace("#comment-", ""))
    : null;

  // ── Fetch comments ────────────────────────────────────────────
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await commentService.getByPost(postId);
        setComments(data ?? []);
      } catch (err) {
        console.error(err);
        setError("Không thể tải bình luận.");
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  // ── Scroll tới comment được highlight ─────────────────────────
  useEffect(() => {
    if (!highlightedCommentId) return;
    setTimeout(() => {
      const el = document.getElementById(`comment-${highlightedCommentId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  }, [highlightedCommentId, comments]);

  // ── Khoá scroll body khi modal mở ─────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ── Thêm comment ──────────────────────────────────────────────
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const data = await commentService.create({
        PostId: postId,
        Content: newComment.trim(),
        ParentId: null,
      });
      if (data) {
        setComments((prev) => [...prev, data]);
        setNewComment("");
        // Scroll xuống comment mới nhất
        setTimeout(() => {
          commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi gửi bình luận");
    }
  };

  // ── Render media ──────────────────────────────────────────────
  const renderMedia = (url: string, index: number) => {
    const fullUrl = resolveUrl(url);
    if (!fullUrl) return null;
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <video
          key={index}
          src={fullUrl}
          controls
          className="w-full rounded-lg object-contain max-h-[400px]"
        />
      );
    }
    return (
      <img
        key={index}
        src={fullUrl}
        className="w-full rounded-lg object-cover max-h-[400px]"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  };

  return (
    // ── Backdrop ──────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-[1000] bg-black/70 flex items-center justify-center p-4"
      onClick={(e) => {
        // Đóng khi click ra ngoài modal
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ── Modal container ─────────────────────────────────────── */}
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#242526] rounded-2xl shadow-2xl border border-[#3e4042] flex overflow-hidden">

        {/* ── Nút đóng ── */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-[#3a3b3c] hover:bg-[#4e4f50] rounded-full flex items-center justify-center text-gray-300 hover:text-white transition"
        >
          ✕
        </button>

        {/* ════════════════════════════════════════════════════════
            CỘT TRÁI — Nội dung bài viết (scroll độc lập)
        ════════════════════════════════════════════════════════ */}
        <div className="w-[55%] border-r border-[#3e4042] flex flex-col overflow-y-auto no-scrollbar">

          {/* Header bài viết */}
          <div className="flex items-center gap-3 p-4 sticky top-0 bg-[#242526] z-10 border-b border-[#3e4042]">
            <img
              src={
                post.authorAvatar
                  ? resolveUrl(post.authorAvatar)
                  : "/assets/img/icons8-user-default-64.png"
              }
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
              onClick={() => post.userId && navigate(`/profile/${post.userId}`)}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "/assets/img/icons8-user-default-64.png";
              }}
            />
            <div>
              <p
                className="font-semibold text-white cursor-pointer hover:underline"
                onClick={() => post.userId && navigate(`/profile/${post.userId}`)}
              >
                {post.fullName}
              </p>
              <p className="text-gray-400 text-xs">
                {new Date(post.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>

          {/* Nội dung bài viết */}
          <div className="p-4 flex flex-col gap-3">
            {post.title && (
              <h3 className="font-bold text-[18px] text-white">{post.title}</h3>
            )}
            <p className="text-gray-200 text-[15px] leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>

            {/* Media */}
            {post.mediaUrls?.length > 0 && (
              <div className={`grid gap-1 ${post.mediaUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                {post.mediaUrls.map((url: string, i: number) => (
                  <div key={i}>{renderMedia(url, i)}</div>
                ))}
              </div>
            )}
          </div>
      </div>

        {/* ════════════════════════════════════════════════════════
            CỘT PHẢI — Comments (scroll độc lập)
        ════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col min-h-0">

          {/* Header cột phải */}
          <div className="px-4 py-3 border-b border-[#3e4042] flex-shrink-0">
            <h3 className="text-white font-bold text-[15px]">
              Bình luận
              {comments.length > 0 && (
                <span className="ml-2 text-gray-400 font-normal text-sm">
                  ({comments.length})
                </span>
              )}
            </h3>
          </div>

          {/* Danh sách comment — scroll */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 no-scrollbar">
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#1877f2]" />
              </div>
            ) : error ? (
              <p className="text-center text-red-500 py-6">{error}</p>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 gap-2">
                <span className="text-3xl">💬</span>
                <p className="text-gray-500 text-sm">Hãy là người đầu tiên bình luận</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div id={`comment-${comment.Id}`} key={comment.Id}>
                  <Comment
                    comment={comment}
                    postId={postId}
                    parentUserName={comment.ParentUserName}
                    highlighted={comment.Id === highlightedCommentId}
                  />
                </div>
              ))
            )}
            {/* Anchor để scroll xuống cuối */}
            <div ref={commentsEndRef} />
          </div>

          {/* Input gửi comment — cố định dưới cùng */}
          <div className="flex-shrink-0 p-4 border-t border-[#3e4042] flex gap-2 items-center bg-[#242526]">
            <input
              type="text"
              placeholder="Viết bình luận..."
              className="flex-1 px-4 py-2.5 bg-[#3a3b3c] border border-[#4e4f50] rounded-2xl
                         text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-[#1877f2] transition"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              autoFocus
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() || loading}
              className="bg-[#1877f2] hover:bg-[#166fe5] disabled:opacity-40 disabled:cursor-not-allowed
                         text-white px-4 py-2.5 rounded-2xl text-sm font-medium transition"
            >
              Gửi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;