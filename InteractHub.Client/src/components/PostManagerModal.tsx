import React, { useEffect, useState } from "react";
import {
  FaTimes, FaTrash, FaGlobe, FaUserFriends,
  FaLock, FaSearch, FaEdit, FaCheck, FaPlus, FaSpinner
} from "react-icons/fa";
import { postService, type PostItem } from "../services/postService";

const API_BASE_URL = "https://localhost:7069";

const resolveUrl = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

const STATUS_OPTIONS = [
  { value: 1, label: "Công khai",  icon: <FaGlobe size={12} />,       color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" },
  { value: 2, label: "Bạn bè",     icon: <FaUserFriends size={12} />, color: "text-blue-400",  bg: "bg-blue-400/10 border-blue-400/30"  },
  { value: 3, label: "Riêng tư",   icon: <FaLock size={12} />,        color: "text-gray-400",  bg: "bg-gray-400/10 border-gray-400/30"  },
];

interface PostManagerModalProps {
  userId: string;
  onClose: () => void;
}

// ── View: danh sách ──────────────────────────────────────────────
const PostManagerModal: React.FC<PostManagerModalProps> = ({ userId, onClose }) => {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [filtered, setFiltered] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<PostItem | null>(null);

  useEffect(() => {
    postService.getPostsByUserId(userId).then((res) => {
      setPosts(res.data);
      setFiltered(res.data);
      setLoading(false);
    });
  }, [userId]);

  // Tìm kiếm
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      posts.filter(
        (p) =>
          (p.content ?? "").toLowerCase().includes(q) ||
          (p.title ?? "").toLowerCase().includes(q)
      )
    );
  }, [search, posts]);

  const handleDelete = async (postId: number) => {
    setDeletingId(postId);
    try {
      await postService.deletePost(postId);
      const next = posts.filter((p) => p.id !== postId);
      setPosts(next);
    } catch (err) {
      console.error("Lỗi xóa bài viết:", err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleUpdateDone = (updated: PostItem) => {
    const next = posts.map((p) => (p.id === updated.id ? updated : p));
    setPosts(next);
    setEditingPost(null);
  };

  // ── Nếu đang edit → render editor ────────────────────────────
  if (editingPost) {
    return (
      <PostEditView
        post={editingPost}
        onDone={handleUpdateDone}
        onBack={() => setEditingPost(null)}
      />
    );
  }

  // ── Danh sách ─────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#242526] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col
                      border border-[#3e4042] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#3e4042] shrink-0">
          <h2 className="text-xl font-bold text-white">Quản lý bài viết</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#3a3b3c] text-gray-400 transition-colors"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 shrink-0">
          <div className="flex items-center gap-2 bg-[#3a3b3c] rounded-xl px-3 py-2">
            <FaSearch size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent flex-1 text-white text-sm outline-none placeholder-gray-500"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-white">
                <FaTimes size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-[#3a3b3c] rounded-xl animate-pulse" />
              ))}
            </>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-10">
              {search ? "Không tìm thấy bài viết." : "Chưa có bài viết nào."}
            </p>
          ) : (
            filtered.map((post) => {
              const statusInfo = STATUS_OPTIONS.find((s) => s.value === post.status) ?? STATUS_OPTIONS[0];
              const thumb = post.mediaUrls?.[0];

              return (
                <div
                  key={post.id}
                  className="flex items-center gap-3 bg-[#3a3b3c] rounded-2xl p-3
                             border border-[#4e4f50] hover:border-[#6e6f70] transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#4e4f50]">
                    {thumb ? (
                      thumb.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={resolveUrl(thumb)} className="w-full h-full object-cover" />
                      ) : (
                        <img src={resolveUrl(thumb)} alt="" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📝</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">
                      {post.content || "Không có nội dung"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5
                                        rounded-full border ${statusInfo.color} ${statusInfo.bg}`}>
                        {statusInfo.icon} {statusInfo.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString("vi-VN")
                          : ""}
                      </span>
                      {post.mediaUrls?.length > 0 && (
                        <span className="text-xs text-gray-500">
                          📎 {post.mediaUrls.length} file
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {confirmDeleteId === post.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400">Xóa?</span>
                        <button
                          onClick={() => handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white
                                     text-xs rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deletingId === post.id ? <FaSpinner className="animate-spin" /> : "Xác nhận"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 bg-[#4e4f50] hover:bg-[#6e6f70]
                                     text-white text-xs rounded-lg transition-colors"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingPost(post)}
                          className="p-2 rounded-xl bg-[#4e4f50] hover:bg-blue-600/20
                                     text-gray-400 hover:text-blue-400 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(post.id)}
                          className="p-2 rounded-xl bg-[#4e4f50] hover:bg-red-600/20
                                     text-gray-400 hover:text-red-400 transition-colors"
                          title="Xóa"
                        >
                          <FaTrash size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#3e4042] shrink-0 text-center">
          <p className="text-gray-500 text-sm">{posts.length} bài viết</p>
        </div>
      </div>
    </div>
  );
};

// ── View: chỉnh sửa ──────────────────────────────────────────────
interface PostEditViewProps {
  post: PostItem;
  onDone: (updated: PostItem) => void;
  onBack: () => void;
}

const PostEditView: React.FC<PostEditViewProps> = ({ post, onDone, onBack }) => {
  const [content, setContent] = useState(post.content ?? "");
  const [title, setTiTle] = useState(post.title ?? "");
  const [status, setStatus] = useState(post.status ?? 1);
  const [existingMedias, setExistingMedias] = useState<string[]>(post.mediaUrls ?? []);
  const [deletedMedias, setDeletedMedias] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleRemoveExisting = (url: string) => {
    setExistingMedias((prev) => prev.filter((u) => u !== url));
    setDeletedMedias((prev) => [...prev, url]);
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveNew = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("Content", content);
      formData.append("Status", String(status));
      deletedMedias.forEach((url) => formData.append("DeleteMediaUrls", url));
      newFiles.forEach((file) => formData.append("NewFiles", file));

      const res = await postService.updatePost(post.id, formData);
      onDone(res.data);
    } catch (err) {
      console.error("Lỗi cập nhật bài viết:", err);
      setError("Không thể lưu thay đổi. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#242526] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col
                      border border-[#3e4042] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-[#3e4042] shrink-0">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-[#3a3b3c] text-gray-400 transition-colors"
          >
            <FaTimes size={18} />
          </button>
          <h2 className="text-xl font-bold text-white flex-1">Chỉnh sửa bài viết</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#1877f2] hover:bg-[#166fe5]
                       text-white text-sm font-semibold rounded-xl transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? <><FaSpinner className="animate-spin" /> Đang lưu...</>
              : <><FaCheck size={13} /> Lưu</>
            }
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/30
                           rounded-xl px-4 py-3">{error}</p>
          )}

          {/* Trạng thái */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Trạng thái</p>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm
                               transition-colors flex-1 justify-center
                               ${status === opt.value
                      ? `${opt.color} ${opt.bg} border-current`
                      : "text-gray-400 bg-[#3a3b3c] border-transparent hover:border-[#6e6f70]"
                    }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Nội dung */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Tiêu đề</p>
            <input
              value={title}
              onChange={(e) => setTiTle(e.target.value)}
              placeholder="Tiêu đề bài viết..."
              className="w-full bg-[#3a3b3c] text-white text-sm rounded-xl px-4 py-3
                         outline-none border border-[#4e4f50] focus:border-[#1877f2]
                         resize-none placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Nội dung */}
          <div>
            <p className="text-gray-400 text-sm mb-2">Nội dung</p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Nội dung bài viết..."
              className="w-full bg-[#3a3b3c] text-white text-sm rounded-xl px-4 py-3
                         outline-none border border-[#4e4f50] focus:border-[#1877f2]
                         resize-none placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Media hiện có */}
          {existingMedias.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Ảnh / Video hiện có</p>
              <div className="grid grid-cols-3 gap-2">
                {existingMedias.map((url) => (
                  <div key={url} className="relative group rounded-xl overflow-hidden
                                             aspect-square bg-[#3a3b3c]">
                    {url.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video src={resolveUrl(url)} className="w-full h-full object-cover" />
                    ) : (
                      <img src={resolveUrl(url)} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => handleRemoveExisting(url)}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/70
                                 text-white opacity-0 group-hover:opacity-100 transition-opacity
                                 hover:bg-red-600"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media mới thêm */}
          {newPreviews.length > 0 && (
            <div>
              <p className="text-gray-400 text-sm mb-2">Ảnh / Video mới thêm</p>
              <div className="grid grid-cols-3 gap-2">
                {newPreviews.map((preview, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden
                                           aspect-square bg-[#3a3b3c]">
                    {newFiles[i]?.type.includes("video") ? (
                      <video src={preview} className="w-full h-full object-cover" />
                    ) : (
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => handleRemoveNew(i)}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/70
                                 text-white opacity-0 group-hover:opacity-100 transition-opacity
                                 hover:bg-red-600"
                    >
                      <FaTrash size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nút thêm file */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                       border-2 border-dashed border-[#4e4f50] hover:border-[#1877f2]
                       text-gray-400 hover:text-[#1877f2] transition-colors text-sm"
          >
            <FaPlus size={13} /> Thêm ảnh / video
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleAddFiles}
          />

        </div>
      </div>
    </div>
  );
};

export default PostManagerModal;