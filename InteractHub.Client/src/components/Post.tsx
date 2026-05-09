import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

import CommentSection from "./CommentSection";
import ReactionModal from "../components/ReactionDetailsModal";
import ReportModal from "../components/ReportModal";
import ShareModal from "./ShareModal";
import MediaGrid from "../components/MediaGrid";

import { likeService } from "../services/likeService";
import { commentService } from "../services/commetService";

import { resolveUrl } from "../utils/urlUtils";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface SharedPost {
  id: number;
  userId?: string;
  fullName: string;
  authorAvatar?: string;
  title?: string;
  content?: string;
  mediaUrls: string[];
  createdAt: string;
}

interface PostProps {
  post: {
    id: string | number;
    userId?: string;
    fullName: string;
    authorAvatar?: string;
    title?: string;
    content?: string;
    mediaUrls: string[];
    createdAt: string;
    status?: number;
    originalPostId?: number;
    originalPost?: SharedPost | null;
    shareCount?: number;
  };
  autoOpenComments?: boolean;
}

// ─────────────────────────────────────────────────────────────
// REACTIONS
// ─────────────────────────────────────────────────────────────

const REACTIONS = [
  { key: "like", emoji: "👍", label: "Thích", color: "text-[#1877f2]" },
  { key: "love", emoji: "❤️", label: "Yêu thích", color: "text-[#f33e58]" },
  { key: "haha", emoji: "😆", label: "Haha", color: "text-[#f7b125]" },
  { key: "wow", emoji: "😮", label: "Wow", color: "text-[#f7b125]" },
  { key: "sad", emoji: "😢", label: "Buồn", color: "text-[#f7b125]" },
  { key: "angry", emoji: "😡", label: "Phẫn nộ", color: "text-[#e9710f]" },
];

export const STATUS_BADGE = {
  [-1]: { label: "Bị xóa", emoji: "🚫", className: "bg-red-500/10 text-red-400" },
  [0]: { label: "Bị vi phạm", emoji: "⚠️", className: "bg-red-500/10 text-red-400" },
  [1]: { label: "Công khai", emoji: "🌍", className: "bg-blue-500/10 text-blue-400" },
  [2]: { label: "Bạn bè", emoji: "👥", className: "bg-green-500/10 text-green-400" },
  [3]: { label: "Riêng tư", emoji: "🔒", className: "bg-gray-500/10 text-gray-400" },
} as const;

type ReactionKey = (typeof REACTIONS)[number]["key"] | null;

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

const Post = ({ post, autoOpenComments = false }: PostProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Kiểm tra bài viết có phải của mình không
  const isOwner = !!user?.Id && user.Id === post.userId;
  const isSharedPost = !!post.originalPostId && !!post.originalPost;

  // ── STATE ────────────────────────────────────────────────────
  const [reaction, setReaction] = useState<ReactionKey>(null);
  const [reactionCount, setReactionCount] = useState(0);
  const [reactionSummary, setReactionSummary] = useState<any>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(post.shareCount ?? 0);
  const [showPicker, setShowPicker] = useState(false);
  const [showComments, setShowComments] = useState(autoOpenComments);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentReaction = REACTIONS.find((r) => r.key === reaction);

  // ── FETCH LIKE ───────────────────────────────────────────────
  const fetchLikeState = useCallback(async () => {
    try {
      const data = await likeService.getState(Number(post.id));
      setReaction(data.UserReaction as ReactionKey);
      setReactionCount(data.Total || 0);
      setReactionSummary(data);
    } catch (error) {
      console.error("Lỗi fetch like:", error);
    }
  }, [post.id]);

  // ── FETCH COMMENT ────────────────────────────────────────────
  const fetchCommentCount = useCallback(async () => {
    try {
      const data = await commentService.getByPost(Number(post.id));
      const countAll = (list: any[]): number =>
        list.reduce(
          (acc, curr) => acc + 1 + (curr.Replies ? countAll(curr.Replies) : 0),
          0
        );
      setCommentCount(countAll(data));
    } catch (error) {
      console.error("Lỗi fetch comment:", error);
    }
  }, [post.id]);

  // ── LOAD ─────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!isMounted) return;
      await fetchLikeState();
      await fetchCommentCount();
    };
    load();
    return () => { isMounted = false; };
  }, [fetchLikeState, fetchCommentCount]);

  // ── HOVER REACTION ───────────────────────────────────────────
  const handleMouseEnterBtn = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
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
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setShowPicker(false), 300);
  };

  // ── REACT ────────────────────────────────────────────────────
  const handleSelectReaction = async (key: string) => {
    try {
      await likeService.react(Number(post.id), key);
      await fetchLikeState();
    } catch (error) {
      console.error("Lỗi react:", error);
    }
    setShowPicker(false);
  };

  const handleClickLikeBtn = async () => {
    await handleSelectReaction(reaction ?? "like");
  };

  const openReactionModal = () => {
    if (reactionSummary) setShowReactionModal(true);
  };

  // Gọi khi ShareModal share thành công — tăng shareCount local
  const handleShareSuccess = () => {
    setShareCount((prev) => prev + 1);
    setIsShareOpen(false);
  };

  const badge =
    typeof post.status === "number"
      ? STATUS_BADGE[post.status as keyof typeof STATUS_BADGE]
      : null;



// tách màu hagtag do thưởng làm 
const renderContent = (text: string) => {
  if (!text) return null;

  return text.split(/(\s+)/).map((part, i) =>
    part.startsWith("#") && part.length > 1 ? (
      <span key={i} className="text-[var(--color-blue)] font-semibold">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};




  // ── RENDER SHARED POST ───────────────────────────────────────
  const renderSharedPost = () => {
    if (!post.originalPost) return null;
    const shared = post.originalPost;






    return (
      <div className="px-4 pb-4">
        <div
          onClick={() => navigate(`/post/${shared.id}`)}
          className="border border-border rounded-2xl overflow-hidden bg-card transition-all cursor-pointer"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            <img
              src={shared.authorAvatar ? resolveUrl(shared.authorAvatar) : "/assets/img/icons8-user-default-64.png"}
              alt={shared.fullName}
              className="w-10 h-10 rounded-full object-cover shrink-0"
              onClick={(e) => { e.stopPropagation(); if (shared.userId) navigate(`/profile/${shared.userId}`); }}
            />
            <div className="flex flex-col">
              <p
                onClick={(e) => { e.stopPropagation(); if (shared.userId) navigate(`/profile/${shared.userId}`); }}
                className="font-semibold text-[15px] leading-tight hover:underline"
              >
                {shared.fullName}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{new Date(new Date(post.createdAt).getTime() + 7 * 60 * 60 * 1000).toLocaleString()}</span>
                <span>·</span>
                <span>🌍</span>
              </div>
            </div>
          </div>

          {/* Content */}
          {(shared.title || shared.content) && (
            <div className="px-4 pb-3">
              {shared.title && (
                <p className="font-bold text-[17px] mb-2 text-[var(--color-text)]">{shared.title}</p>
              )}
              {shared.content && (
                <p className="text-[15px] text-[var(--color-text)] whitespace-pre-wrap break-words leading-relaxed">
                  {shared.content}
                </p>
              )}
            </div>
          )}

          {/* Media */}
          {shared.mediaUrls?.length > 0 && (
            <div className="border-t border-border">
              <MediaGrid mediaUrls={shared.mediaUrls} />
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="bg-card border border-[var(--color-border)] rounded-3xl shadow-xl mb-6 overflow-hidden text-[var(--color-text)]">

      {/* HEADER */}
      <div className="flex items-start gap-3 p-4">
        <img
          src={post.authorAvatar ? resolveUrl(post.authorAvatar) : "/assets/img/icons8-user-default-64.png"}
          alt={post.fullName}
          className="w-11 h-11 rounded-full object-cover ring-0 ring-gray-700 cursor-pointer shrink-0"
          onClick={() => { if (post.userId) navigate(`/profile/${post.userId}`); }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/assets/img/icons8-user-default-64.png"; }}
        />
        <div className="flex-1 min-w-0">
          {isSharedPost && (
            <p className="text-sm text-gray-400 mb-1">🔁 Đã chia sẻ một bài viết</p>
          )}
          <p
            onClick={() => { if (post.userId) navigate(`/profile/${post.userId}`); }}
            className="font-semibold text-[17px] cursor-pointer hover:underline leading-tight"
          >
            {post.fullName}
          </p>
          {/* <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-gray-400 text-sm">
              {new Date(post.createdAt).toLocaleString("vi-VN")}
            </p>
            {typeof post.status === "number" && STATUS_BADGE[post.status] && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[post.status].className}`}>
                {STATUS_BADGE[post.status].emoji} {STATUS_BADGE[post.status].label}
              </span>
            )}
          </div> */}

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-gray-400 text-sm">
              {post.createdAt
                ? new Date(post.createdAt).toLocaleString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })
                : "N/A"}
            </p>

            {badge ? (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
                {badge.emoji} {badge.label}
              </span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-gray-200 text-gray-500">
                ❓ Không xác định
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      {post.title && (
        <div className="px-4 pt-4 pb-2">
          <p className="font-bold text-[17px] mb-1 text-[var(--color-text)]">{post.title}</p>
        </div>
      )}
      {post.content && (
        <div className="px-4 pt-0 pb-3">
          <p className="text-[15px] text-[var(--color-text)] whitespace-pre-wrap break-words leading-relaxed">
            {renderContent(post.content)}
          </p>
        </div>
      )}

      {/* MEDIA — bài thường */}
      {!isSharedPost && post.mediaUrls?.length > 0 && (
        <div className="p-0">
          <MediaGrid mediaUrls={post.mediaUrls} />
        </div>
      )}

      {/* MEDIA — bài share */}
      {isSharedPost && renderSharedPost()}

      {/* REACTION & COMMENT & SHARE COUNT */}
      {(reactionCount > 0 || commentCount > 0 || shareCount > 0) && (
        <div className="px-4 py-2 border-t border-[var(--color-border)] text-gray-400 text-sm flex justify-between items-center">
          {/* Reaction count */}
          <div
            onClick={openReactionModal}
            className="cursor-pointer hover:underline flex items-center gap-1"
          >
            {reactionCount > 0 && <span>{reactionCount} lượt cảm xúc</span>}
          </div>

          {/* Comment + Share count */}
          <div className="flex items-center gap-3">
            {commentCount > 0 && (
              <div
                onClick={() => setShowComments(true)}
                className="cursor-pointer hover:underline"
              >
                {commentCount} bình luận
              </div>
            )}
            {/* {shareCount >= 0 && (
              <div className="flex items-center gap-1 text-gray-400">
                <span>🔗</span>
                <span>{shareCount} lượt chia sẻ</span>
              </div>
            )} */}
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex border-t border-[var(--color-border)] divide-x divide-[var(--color-border)]">

        {/* LIKE */}
        <div className="flex-1 relative">
          {showPicker && (
            <div
              onMouseEnter={handleMouseEnterPicker}
              onMouseLeave={handleMouseLeavePicker}
              className="absolute bottom-[110%] left-2 z-50 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-full px-3 py-2 flex gap-2 shadow-2xl"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleSelectReaction(r.key)}
                  title={r.label}
                  className="group flex flex-col items-center hover:scale-125  duration-200"
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="text-[10px] text-[var(--color-text)] opacity-0 group-hover:opacity-100">
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
            className={`w-full py-4 flex items-center justify-center gap-2 transition-colors
              ${currentReaction ? currentReaction.color : "text-[var(--color-text)] hover:bg-[var(--color-blue)]"}`}
          >
            <span className="text-xl">{currentReaction ? currentReaction.emoji : "👍"}</span>
            <span className="font-medium">{currentReaction ? currentReaction.label : "Thích"}</span>
          </button>
        </div>

        {/* COMMENT */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-4 text-[var(--color-text)] hover:bg-[var(--color-blue)] transition"
        >
          💬 Bình luận
        </button>

        {/* SHARE — ẩn nếu là bài của chính mình */}
        {!isOwner && (
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex-1 py-4 text-[var(--color-text)] hover:bg-[var(--color-blue)] transition"
          >
            🔗 Chia sẻ
          </button>
        )}

        {/* REPORT */}
        <button
          onClick={() => setIsReportOpen(true)}
          className="flex-1 py-4 text-[var(--color-text)] hover:bg-[var(--color-blue)] transition"
        >
          🚩 Báo cáo
        </button>
      </div>

      {/* MODALS */}
      {isReportOpen && (
        <ReportModal postId={Number(post.id)} onClose={() => setIsReportOpen(false)} />
      )}

      {isShareOpen && (
        <ShareModal
          post={post}
          onClose={() => setIsShareOpen(false)}
          onSuccess={handleShareSuccess}
        />
      )}

      {showReactionModal && reactionSummary && (
        <ReactionModal
          postId={Number(post.id)}
          summary={reactionSummary}
          onClose={() => setShowReactionModal(false)}
          resolveUrl={resolveUrl}
        />
      )}

      {/* COMMENTS */}
      {showComments && (
        <div className="border-t border-border">
          <CommentSection
            postId={Number(post.id)}
            authorId={post.userId}
            post={{
              ...post,
              content: post.content ?? "",
              originalPost: post.originalPost
                ? { ...post.originalPost, content: post.originalPost.content ?? "" }
                : post.originalPost,
            }}
            onClose={() => setShowComments(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Post;