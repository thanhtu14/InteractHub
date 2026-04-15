import { useState, useRef, useEffect, useCallback } from "react";
import CommentSection from "./CommentSection";
import ReactionModal from "../components/ReactionDetailsModal";
import { likeService } from "../services/likeService";
import { commentService } from "../services/commetService";

interface PostProps {
  post: {
    id: string | number;
    fullName: string;
    authorAvatar?: string;
    title?: string;
    content: string;
    mediaUrls: string[];
    createdAt: string;
    status?: number; // ← thêm
  };
}

const API_BASE_URL = "https://localhost:7069";

const resolveUrl = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

const REACTIONS = [
  { key: "like", emoji: "👍", label: "Thích", color: "text-[#1877f2]" },
  { key: "love", emoji: "❤️", label: "Yêu thích", color: "text-[#f33e58]" },
  { key: "haha", emoji: "😆", label: "Haha", color: "text-[#f7b125]" },
  { key: "wow", emoji: "😮", label: "Wow", color: "text-[#f7b125]" },
  { key: "sad", emoji: "😢", label: "Buồn", color: "text-[#f7b125]" },
  { key: "angry", emoji: "😡", label: "Phẫn nộ", color: "text-[#e9710f]" },
];
// ── Badge phạm vi ─────────────────────────────────────────
const STATUS_BADGE: Record<number, { label: string; emoji: string; className: string }> = {
  1: { label: "Công khai", emoji: "🌍", className: "bg-blue-500/10 text-blue-400" },
  2: { label: "Bạn bè", emoji: "👥", className: "bg-green-500/10 text-green-400" },
  3: { label: "Riêng tư", emoji: "🔒", className: "bg-gray-500/10 text-gray-400" },
};
type ReactionKey = (typeof REACTIONS)[number]["key"] | null;
type Orientation = "portrait" | "landscape" | "square";

const getOrientation = (url: string): Promise<Orientation> =>
  new Promise((resolve) => {
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        if (video.videoHeight > video.videoWidth) resolve("portrait");
        else if (video.videoWidth > video.videoHeight) resolve("landscape");
        else resolve("square");
      };
      video.onerror = () => resolve("landscape");
      video.src = url;
      return;
    }
    const img = new Image();
    img.onload = () => {
      if (img.naturalHeight > img.naturalWidth) resolve("portrait");
      else if (img.naturalWidth > img.naturalHeight) resolve("landscape");
      else resolve("square");
    };
    img.onerror = () => resolve("landscape");
    img.src = url;
  });

const Post = ({ post }: PostProps) => {
  const [reaction, setReaction] = useState<ReactionKey>(null);
  const [reactionCount, setReactionCount] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [orientations, setOrientations] = useState<Orientation[] | null>(null);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [reactionSummary, setReactionSummary] = useState<any>(null);

  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentReaction = REACTIONS.find((r) => r.key === reaction);
  const [commentCount, setCommentCount] = useState(0);

  // ── FETCH COMMENT COUNT ──────────────────────────────────────
  const fetchCommentCount = useCallback(async () => {
    try {
      const res = await commentService.getByPost(post.id as number);
      if (res.Success && res.Data) {
        // Hàm đệ quy để đếm tất cả các node trong cây comment
        const countAll = (list: any[]): number => {
          return list.reduce((acc, curr) => {
            const repliesCount = curr.Replies ? countAll(curr.Replies) : 0;
            return acc + 1 + repliesCount;
          }, 0);
        };
        setCommentCount(countAll(res.Data));
      }
    } catch (error) {
      console.error("Lỗi fetch comment:", error);
    }
  }, [post.id]);
  // ── LOGIC FETCH STATE (Hỗ trợ cả PascalCase và camelCase) ──────
  const fetchLikeState = useCallback(async () => {
    try {
      const res = await likeService.getState(post.id as number);

      // SỬA TẠI ĐÂY: Dùng Success và Data viết hoa
      if (res.Success && res.Data) {
        // UserReaction và Total cũng viết hoa theo LikeStateDto bên C#
        setReaction(res.Data.UserReaction as ReactionKey);
        setReactionCount(res.Data.Total || 0);
        setReactionSummary(res.Data);
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
  }, [post.id]);
useEffect(() => {
  let isMounted = true; // Biến cờ để tránh update state khi component đã unmount

  const loadData = async () => {
    if (isMounted) {
      await fetchLikeState();
      await fetchCommentCount();
    }
  };

  loadData();

  return () => {
    isMounted = false; // Cleanup function
  };
}, [fetchLikeState, fetchCommentCount]);

  // ── LOGIC MEDIA ORIENTATION ────────────────────────────────────
  useEffect(() => {
    if (!post.mediaUrls?.length) return;
    Promise.all(
      post.mediaUrls.map((url) => getOrientation(resolveUrl(url)))
    ).then(setOrientations);
  }, [post.mediaUrls]);


  // ── EVENT HANDLERS ─────────────────────────────────────────────
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

  const handleSelectReaction = async (key: string) => {
    try {
      const res = await likeService.react(post.id as number, key);
      // SỬA TẠI ĐÂY
      if (res.Success) {
        await fetchLikeState();
      }
    } catch (error) {
      console.error("Lỗi:", error);
    }
    setShowPicker(false);
  };

  const handleClickLikeBtn = async () => {
    const targetKey = reaction ? reaction : "like";
    await handleSelectReaction(targetKey);
  };

  const openReactionModal = () => {
    if (reactionSummary) setShowReactionModal(true);
  };

  // ── MEDIA RENDERING ─────────────────────────────────────────────
  const renderMedia = (url: string, index: number) =>
    url.match(/\.(mp4|webm|ogg)$/i) ? (
      <video
        key={index}
        src={resolveUrl(url)}
        controls
        className="w-full h-auto object-contain max-h-[500px]"
      />
    ) : (
      <img
        key={index}
        src={resolveUrl(url)}
        alt={`media-${index}`}
        className="w-full h-auto object-contain max-h-[500px]"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );

  const renderMediaGrid = () => {
    const urls = post.mediaUrls;
    if (!urls?.length) return null;
    if (!orientations) return <div className="w-full h-48 bg-[#3a3b3c] rounded-xl animate-pulse" />;

    const total = urls.length;
    const firstIsPortrait = orientations[0] === "portrait";

    // ── 1 media ──────────────────────────────────────────────
    if (total === 1) {
      return (
        <div className="overflow-hidden rounded-2xl">
          {renderMedia(urls[0], 0)}
        </div>
      );
    }

    // ── 2 media ──────────────────────────────────────────────
    if (total === 2) {
      const allPortrait = orientations.every((o) => o === "portrait");

      // Cả 2 dọc → side by side bằng nhau
      if (allPortrait) {
        return (
          <div className="grid grid-cols-2 gap-1">
            {urls.map((url, i) => (
              <div key={i} className="overflow-hidden rounded-2xl">
                {renderMedia(url, i)}
              </div>
            ))}
          </div>
        );
      }

      // Mixed hoặc cả 2 ngang → xếp dọc, tự co height
      return (
        <div className="flex flex-col gap-1">
          {urls.map((url, i) => (
            <div key={i} className="overflow-hidden rounded-2xl">
              {renderMedia(url, i)}
            </div>
          ))}
        </div>
      );
    }

    // ── 3 media ──────────────────────────────────────────────
    if (total === 3) {
      // Ảnh đầu dọc → bên trái, 2 ảnh còn lại xếp dọc bên phải
      if (firstIsPortrait) {
        return (
          <div className="flex gap-1">
            <div className="w-[55%] overflow-hidden rounded-2xl">
              {renderMedia(urls[0], 0)}
            </div>
            <div className="flex flex-col gap-1 flex-1">
              {urls.slice(1).map((url, i) => (
                <div key={i + 1} className="flex-1 overflow-hidden rounded-2xl min-h-[150px]">
                  {renderMedia(url, i + 1)}
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Ảnh đầu ngang → full width, 2 ảnh còn lại side by side
      return (
        <div className="flex flex-col gap-1">
          <div className="overflow-hidden rounded-2xl">
            {renderMedia(urls[0], 0)}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {urls.slice(1).map((url, i) => (
              <div key={i + 1} className="overflow-hidden rounded-2xl min-h-[150px]">
                {renderMedia(url, i + 1)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── 4+ media ─────────────────────────────────────────────
    const remaining = urls.slice(1, 4);
    const extra = total - 4;

    // Ảnh đầu dọc → bên trái, 3 ảnh còn lại xếp dọc bên phải
    if (firstIsPortrait) {
      return (
        <div className="flex gap-1 h-[500px]">
          <div className="w-[55%] overflow-hidden rounded-2xl">
            {renderMedia(urls[0], 0)}
          </div>
          <div className="flex flex-col gap-1 flex-1">
            {remaining.map((url, i) => (
              <div key={i + 1} className="relative flex-1 overflow-hidden rounded-2xl">
                {renderMedia(url, i + 1)}
                {i === 2 && extra > 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                    <span className="text-white text-2xl font-bold">+{extra}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Ảnh đầu ngang → full width, 3 ảnh còn lại chia 3 cột
    return (
      <div className="flex flex-col gap-1">
        <div className="overflow-hidden rounded-2xl">
          {renderMedia(urls[0], 0)}
        </div>
        <div className="grid grid-cols-3 gap-1 h-[180px]">
          {remaining.map((url, i) => (
            <div key={i + 1} className="relative overflow-hidden rounded-2xl">
              {renderMedia(url, i + 1)}
              {i === 2 && extra > 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-2xl">
                  <span className="text-white text-2xl font-bold">+{extra}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  return (
    <div className="bg-[#242526] border border-[#3e4042] rounded-3xl shadow-xl mb-6 overflow-hidden text-white">
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4">
        <img
          src={post.authorAvatar ? resolveUrl(post.authorAvatar) : "/assets/img/icons8-user-default-64.png"}
          alt={post.fullName}
          className="w-11 h-11 rounded-full object-cover ring-2 ring-gray-700"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/assets/img/icons8-user-default-64.png"; }}
        />
        <div>
          <p className="font-semibold text-[17px]">{post.fullName}</p>
          <div className="flex items-center gap-2">
            <p className="text-gray-400 text-sm">
              {new Date(post.createdAt).toLocaleString("vi-VN")}
            </p>
            {/* ── Badge phạm vi ── */}
            {post.status && STATUS_BADGE[post.status] && (
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[post.status].className}`}>
                {STATUS_BADGE[post.status].emoji} {STATUS_BADGE[post.status].label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 pb-3">
        {post.title && <p className="font-bold text-[18px] mb-1">{post.title}</p>}
        <p className="text-[17px] text-gray-200 leading-relaxed">{post.content}</p>
      </div>

      {/* MEDIA */}
      {post.mediaUrls?.length > 0 && <div className="px-4 pb-4">{renderMediaGrid()}</div>}

      {/* REACTION & COMMENT COUNT */}
      {/* REACTION & COMMENT COUNT */}
      {(reactionCount > 0 || commentCount > 0) && ( // Dùng state commentCount ở đây
        <div className="px-4 py-2 border-t border-[#3e4042] text-gray-400 text-sm flex justify-between items-center">
          <div
            onClick={openReactionModal}
            className="cursor-pointer hover:underline flex items-center gap-2"
          >
            {/* Giữ nguyên phần icon cảm xúc của bạn... */}
            <span>{reactionCount > 0 ? reactionCount : ""} lượt cảm xúc</span>
          </div>

          <div
            onClick={() => setShowComments(true)}
            className="cursor-pointer hover:underline"
          >
            {/* Chỉ hiện chữ khi có comment thực sự */}
            {commentCount > 0 ? `${commentCount} bình luận` : ""}
          </div>
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex border-t border-[#3e4042] divide-x divide-[#3e4042]">
        <div className="flex-1 relative">
          {showPicker && (
            <div
              onMouseEnter={handleMouseEnterPicker}
              onMouseLeave={handleMouseLeavePicker}
              className="absolute bottom-[110%] left-2 z-50 bg-[#3a3b3c] border border-[#4e4f50] rounded-full px-3 py-2 flex gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleSelectReaction(r.key)}
                  title={r.label}
                  className="group flex flex-col items-center hover:scale-125 transition duration-200"
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100">{r.label}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleClickLikeBtn}
            onMouseEnter={handleMouseEnterBtn}
            onMouseLeave={handleMouseLeaveBtn}
            className={`w-full py-4 flex items-center justify-center gap-2 transition-colors
              ${currentReaction ? currentReaction.color : "text-gray-300 hover:bg-[#3a3b3c]"}`}
          >
            <span className="text-xl">{currentReaction ? currentReaction.emoji : "👍"}</span>
            <span className="font-medium">{currentReaction ? currentReaction.label : "Thích"}</span>
          </button>
        </div>

        <button onClick={() => setShowComments(!showComments)} className="flex-1 py-4 text-gray-300 hover:bg-[#3a3b3c]">
          💬 Bình luận
        </button>

        <button className="flex-1 py-4 text-gray-300 hover:bg-[#3a3b3c]">
          🔗 Chia sẻ
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="border-t border-[#3e4042]">
          <CommentSection
            postId={Number(post.id)}
            onClose={() => setShowComments(false)}
          />
        </div>
      )}

      {/* MODAL */}
      {showReactionModal && reactionSummary && (
        <ReactionModal
          postId={Number(post.id)}
          summary={reactionSummary} // Truyền cái này sang Modal
          onClose={() => setShowReactionModal(false)}
          resolveUrl={resolveUrl}
        />
      )}
    </div>
  );
};

export default Post;