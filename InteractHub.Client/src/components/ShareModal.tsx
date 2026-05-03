import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/useAuth";
import { toast } from "react-toastify";

import {
  friendshipService,
  type UserDto,
} from "../services/friendshipService";

import { messageService } from "../services/messageService";
import { postService } from "../services/postService";

import { resolveUrl } from "../utils/urlUtils";
import { removeVietnameseTones } from "../utils/stringUtils";

import MediaGrid from "../components/MediaGrid";

// ── Types ──────────────────────────────────────────────────────
interface SharedPostPreview {
  fullName?: string;
  authorAvatar?: string;
  title?: string;
  content?: string;
  mediaUrls?: string[];
  createdAt?: string;
}

interface FriendType {
  id: string;
  fullName: string;
  avatarUrl?: string;
}

interface ShareModalProps {
  post: {
    id: string | number;

    title?: string;
    content?: string;

    fullName?: string;
    authorAvatar?: string;

    mediaUrls?: string[];

    originalPost?: SharedPostPreview | null;
    createdAt?: string;

  };

  onClose: () => void;

  onShared?: () => void;
  onSuccess?: () => void; // 👈 THÊM Ở ĐÂY

}

// ── Component ──────────────────────────────────────────────────
const ShareModal = ({
  post,
  onClose,
  onShared,
}: ShareModalProps) => {
  const { user } = useAuth();

  // ── State ────────────────────────────────────────────────────
  const [friends, setFriends] = useState<FriendType[]>([]);
  const [loading, setLoading] = useState(true);

  const [copied, setCopied] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");

  const [sendingIds, setSendingIds] = useState<string[]>([]);

  const [sharing, setSharing] = useState(false);

  // 1 = Public
  // 2 = Friends
  // 3 = Private
  const [privacy, setPrivacy] = useState<1 | 2 | 3>(1);

  const [shareContent, setShareContent] = useState("");

  const shareUrl = `${window.location.origin}/post/${post.id}`;

  // ── Share Preview ────────────────────────────────────────────
  const previewPost = post.originalPost ?? post;

  // ============================================================
  // SHARE TO FEED
  // ============================================================

  const handleShareToFeed = async () => {
    if (sharing) return;

    try {
      setSharing(true);

      await postService.sharePost({
        originalPostId: Number(post.id),
        content: shareContent,
        status: privacy,
      });

      toast.success("Đã share bài viết thành công!");


      onShared?.();

      onClose();
    } catch (error) {
      console.error(error);

      toast.error("Đã có lỗi khi share bài viết!");

    } finally {
      setSharing(false);
    }
  };

  // ============================================================
  // COPY LINK
  // ============================================================

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error(error);

      toast.success("Không thể sao chép liên kết!");

    }
  };

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSend = async (friendId: string) => {
    if (sendingIds.includes(friendId)) return;

    try {
      setSendingIds((prev) => [...prev, friendId]);

      const convRes =
        await messageService.getOrCreateConversation(friendId);

      await messageService.sendMessage(
        convRes.data.id,
        shareUrl
      );
    } catch (error) {
      console.error(error);

      toast.error("Không thể gửi tin nhắn!");
      ;
    } finally {
      setSendingIds((prev) =>
        prev.filter((id) => id !== friendId)
      );
    }
  };

  // ============================================================
  // FETCH FRIENDS
  // ============================================================

  useEffect(() => {
    if (!user?.Id) return;

    const fetchFriends = async () => {
      try {
        setLoading(true);

        const res = await friendshipService.getFriendsList(
          user.Id
        );

        const mappedFriends = (res.data as UserDto[]).map(
          (friend) => ({
            id: friend.Id,
            fullName: friend.Username || "Người dùng",
            avatarUrl: friend.AvatarUrl,
          })
        );

        setFriends(mappedFriends);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user?.Id]);

  // ============================================================
  // FILTER FRIENDS
  // ============================================================


  const renderContentWithHashtag = (text: string) => {
    const parts = text.split(/(#\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <span key={index} className="text-blue-400 font-medium cursor-pointer">
            {part}
          </span>
        );
      }
      return part;
    });
  };


  const filteredFriends = useMemo(() => {
    return friends.filter((friend) =>
      removeVietnameseTones(
        friend.fullName.toLowerCase()
      ).includes(
        removeVietnameseTones(
          searchKeyword.toLowerCase()
        )
      )
    );
  }, [friends, searchKeyword]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg p-4">

      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">

          <h3 className="text-lg font-semibold text-[var(--color-text)]">
            Chia sẻ bài viết
          </h3>

          <button
            onClick={onClose}
            className="text-2xl text-gray-400 transition hover:text-[var(--color-text)]"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="custom-scrollbar max-h-[85vh] overflow-y-auto p-4 space-y-4">

          {/* USER CONTENT */}
          <textarea
            value={shareContent}
            onChange={(e) =>
              setShareContent(e.target.value)
            }
            placeholder="Viết gì đó về bài viết này..."
            rows={3}
            className="
              w-full
              resize-none
              rounded-2xl
              border border-[var(--color-border)]
              bg-[var(--color-bg)]
              px-4
              py-3
              text-[15px]
              text-[var(--color-text)]
              outline-none
              transition
              focus:border-blue-500
            "
          />

          {/* ── PREVIEW POST ───────────────────────────── */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">

            {/* HEADER */}
            <div className="flex items-center gap-3 border-b border-border p-4">

              <img
                src={
                  previewPost.authorAvatar
                    ? resolveUrl(previewPost.authorAvatar)
                    : "/assets/img/icons8-user-default-64.png"
                }
                alt={previewPost.fullName}
                className="h-11 w-11 rounded-full object-cover"
              />

              <div>
                <p className="font-semibold text-[var(--color-text)]">
                  {previewPost.fullName || "Người dùng"}
                </p>

                {previewPost.createdAt && (
                  <p className="text-xs text-gray-400">
                    {new Date(
                      previewPost.createdAt
                    ).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-4">

              {previewPost.title && (
                <p className="mb-2 text-[17px] font-bold text-[var(--color-text)]">
                  {previewPost.title}
                </p>
              )}

              {previewPost.content && (
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--color-text)]">
                  {renderContentWithHashtag(previewPost.content)}
                </p>
              )}
            </div>

            {/* MEDIA */}
            {previewPost.mediaUrls &&
              previewPost.mediaUrls.length > 0 && (
                <div className="px-4 pb-4">
                  <MediaGrid
                    mediaUrls={previewPost.mediaUrls}
                  />
                </div>
              )}
          </div>

          {/* PRIVACY */}
          <div>

            <p className="mb-2 text-sm text-gray-400">
              Ai có thể xem?
            </p>

            <div className="flex gap-2">

              {/* PUBLIC */}
              <button
                onClick={() => setPrivacy(1)}
                className={`
                  flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all
                  ${privacy === 1
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-gray-600 text-[var(--color-text)]"
                  }
                `}
              >
                🌍 Công khai
              </button>

              {/* FRIEND */}
              <button
                onClick={() => setPrivacy(2)}
                className={`
                  flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all
                  ${privacy === 2
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-gray-600 text-[var(--color-text)]"
                  }
                `}
              >
                👥 Bạn bè
              </button>

              {/* PRIVATE */}
              <button
                onClick={() => setPrivacy(3)}
                className={`
                  flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all
                  ${privacy === 3
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-gray-600 text-[var(--color-text)]"
                  }
                `}
              >
                🔒 Riêng tư
              </button>
            </div>
          </div>

          {/* SHARE BUTTON */}
          <button
            onClick={handleShareToFeed}
            disabled={sharing}
            className="
              w-full rounded-2xl bg-blue-600 py-3
              text-[17px] font-semibold text-[var(--color-text)] transition
              hover:bg-blue-700
              disabled:bg-gray-600
            "
          >
            {sharing
              ? "Đang chia sẻ..."
              : "Chia sẻ ngay"}
          </button>

          {/* COPY LINK */}
          <div>

            <p className="mb-1.5 text-xs text-gray-400">
              LIÊN KẾT
            </p>

            <div className="flex gap-2">

              <input
                readOnly
                value={shareUrl}
                className="
                  flex-1 rounded-2xl border border-[var(--color-border)]
                  bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)]
                  outline-none
                "
              />

              <button
                onClick={handleCopyLink}
                className={`
                  rounded-2xl px-5 font-medium text-[var(--color-text)] transition-all
                  ${copied
                    ? "bg-green-600"
                    : "bg-blue-600 hover:bg-blue-700"
                  }
                `}
              >
                {copied ? "Đã chép" : "Sao chép"}
              </button>
            </div>
          </div>

          {/* SEND MESSAGE */}
          <div>

            <p className="mb-2 text-xs text-gray-400">
              GỬI QUA TIN NHẮN
            </p>

            {/* SEARCH */}
            <div className="relative">

              <input
                type="text"
                placeholder="Tìm kiếm bạn bè..."
                value={searchKeyword}
                onChange={(e) =>
                  setSearchKeyword(e.target.value)
                }
                className="
                  w-full rounded-2xl border border-[var(--color-border)]
                  bg-[var(--color-bg)] py-3 pl-11 pr-4 text-sm text-[var(--color-text)]
                  outline-none
                "
              />

              <span className="absolute left-4 top-3.5 text-gray-400">
                🔍
              </span>
            </div>

            {/* FRIEND LIST */}
            <div className="custom-scrollbar mt-2 max-h-60 overflow-y-auto space-y-1">

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-2xl bg-[var(--color-bg)]"
                    />
                  ))}
                </div>
              ) : filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => {
                  const isSending =
                    sendingIds.includes(friend.id);

                  return (
                    <div
                      key={friend.id}
                      className="
                        flex items-center justify-between
                        rounded-2xl p-2.5 transition
                        hover:bg-[var(--color-bg)]
                      "
                    >

                      <div className="flex items-center gap-3">

                        <img
                          src={
                            friend.avatarUrl
                              ? resolveUrl(
                                friend.avatarUrl
                              )
                              : "/assets/img/icons8-user-default-64.png"
                          }
                          alt={friend.fullName}
                          className="h-9 w-9 rounded-full object-cover"
                        />

                        <span className="text-[15px] text-[var(--color-text)]">
                          {friend.fullName}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleSend(friend.id)
                        }
                        disabled={isSending}
                        className={`
                          rounded-xl px-5 py-1.5 text-sm transition-all
                          ${isSending
                            ? "bg-gray-600 text-gray-400"
                            : "bg-blue-600 text-[var(--color-text)] hover:bg-blue-700"
                          }
                        `}
                      >
                        {isSending
                          ? "Đang gửi..."
                          : "Gửi"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="py-6 text-center text-gray-500">
                  Không tìm thấy bạn bè
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;