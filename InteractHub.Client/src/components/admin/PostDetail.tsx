import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MediaGrid from "../../components/MediaGrid";
import { commentService } from "../../services/commetService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CommentDTO {
    Id: number;
    Content: string;
    UserId: string;
    UserName: string;
    UserAvatar?: string | null;
    PostId: number;
    ParentId?: number | null;
    ParentUserName?: string | null;
    Status?: number | null;
    CreatedAt?: string | null;
    LikeCount: number;
    IsLikedByCurrentUser: boolean;
    Replies: CommentDTO[];
}

interface Post {
    id: string;
    author: string;
    authorAvatar: string;
    title: string;
    content: string;
    countLike: number;
    likes: { UserId: string; UserName: string; Avatar: string; Type?: string }[];
    countComment: number;
    comments: CommentDTO[];
    status: 'public' | 'friend' | 'private' | 'hidden' | 'delete';
    createdAt: string;
    mediaUrls?: string[];
    SharedPost?: Post | null;

}

interface PostDetailProps {
    post: Post;
    onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build comment tree an toàn:
 * - Nếu API đã trả về tree (Replies có data) → dùng luôn
 * - Nếu API trả về flat list (Replies rỗng, ParentId có giá trị) → tự build
 */
// const buildCommentTree = (comments: CommentDTO[]): CommentDTO[] => {
//     // Kiểm tra xem có phải flat list không
//     const hasFlatReplies = comments.some(
//         c => c.ParentId != null && (c.Replies == null || c.Replies.length === 0)
//     );

//     if (!hasFlatReplies) {
//         // API đã trả về tree đúng → lọc chỉ lấy root (ParentId null)
//         return comments.filter(c => c.ParentId == null);
//     }

//     // Tự build tree từ flat list
//     const map = new Map<number, CommentDTO>();
//     const roots: CommentDTO[] = [];

//     comments.forEach(c => map.set(c.Id, { ...c, Replies: [] }));
//     comments.forEach(c => {
//         const node = map.get(c.Id)!;
//         if (c.ParentId != null && map.has(c.ParentId)) {
//             map.get(c.ParentId)!.Replies.push(node);
//         } else {
//             roots.push(node);
//         }
//     });

//     return roots;
// };

const formatRelativeTime = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return `${diff} giây`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
    return `${Math.floor(diff / 86400)} ngày`;
};

// const getStatusInfo = (status?: number | null) => {
//     switch (status) {
//         case 1: return { text: "Đang hiển thị", color: "#22c55e" };
//         case 0: return { text: "Đã xóa", color: "#ef4444" };
//         case -1: return { text: "Đã ẩn", color: "#9ca3af" };
//         default: return { text: "", color: "" };
//     }
// };

const countAllComments = (comments: CommentDTO[]): number =>
    comments.reduce((sum, c) => sum + 1 + countAllComments(c.Replies ?? []), 0);

// ─── Avatar ───────────────────────────────────────────────────────────────────

// const Avatar = ({ src, name, size = 32 }: { src?: string | null; name: string; size?: number }) => (
//     <div style={{
//         width: size, height: size, borderRadius: '50%',
//         background: src ? 'transparent' : '#4a4b4c',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         fontSize: Math.floor(size * 0.42), fontWeight: 700, color: '#e4e6eb',
//         flexShrink: 0, overflow: 'hidden',
//     }}>
//         {src
//             ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//             : (name || "?").charAt(0).toUpperCase()
//         }
//     </div>
// );

const BASE_URL = "https://localhost:7069";

const getFullImageUrl = (url?: string | null) => {
    if (!url) return "";
    return url.startsWith("http") ? url : BASE_URL + url;
};

// ─── CommentItem ──────────────────────────────────────────────────────────────
const CommentItem = ({
    comment,
    level = 0,
    onHide,
    onDelete,
    onRestore
}: {
    comment: CommentDTO;
    level?: number;
    onHide?: (id: number) => void;
    onDelete?: (id: number) => void;
    onRestore?: (id: number) => void;
}) => {
    const [showReplies, setShowReplies] = useState(false);

    const name = comment.UserName || "Unknown";
    const replies = comment.Replies ?? [];
    const hasReplies = replies.length > 0;

    return (
        <div
            className={`mt-3 ${comment.Status === 0 || comment.Status === -1 ? "opacity-50" : ""}`}
            style={{ marginLeft: 12 + level * 20 }}
        >

            {/* ROW */}
            <div className="flex gap-2 items-start">

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-[var(--color-text)] overflow-hidden">
                    {comment.UserAvatar
                        ? <img
                            src={getFullImageUrl(comment.UserAvatar)}
                            className="w-full h-full object-cover"
                        />
                        : (name || "").charAt(0).toUpperCase()
                    }
                </div>

                {/* RIGHT */}
                <div className="flex-1">

                    {/* Bubble */}
                    <div className="bg-gray-200 rounded-2xl px-3 py-2 inline-block max-w-full">
                        <p className="text-sm font-semibold text-gray-900">
                            {name}
                        </p>

                        <p className="text-sm text-gray-800">
                            {comment.ParentUserName && (
                                <span className="text-blue-500 font-semibold mr-1">
                                    @{comment.ParentUserName}
                                </span>
                            )}
                            {comment.Content}
                        </p>
                    </div>

                    {/* ACTION */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 ml-1">

                        {/* LIKE */}
                        <span className="cursor-pointer hover:underline">
                            👍 Thích
                        </span>

                        {/* REPLY / VIEW REPLIES */}
                        {!hasReplies ? (
                            <span className="cursor-pointer hover:underline">
                                💬 Trả lời
                            </span>
                        ) : (
                            <span
                                onClick={() => setShowReplies(!showReplies)}
                                className="cursor-pointer text-blue-500 hover:underline"
                            >
                                {showReplies
                                    ? "Ẩn comment"
                                    : `Hiện tất cả comment (${replies.length})`}
                            </span>
                        )}

                        {/* TIME */}
                        <span>{formatRelativeTime(comment.CreatedAt)}</span>

                        {/* 🔥 ADMIN ACTION */}
                        {comment.Status === 0 ? (
                            <span
                                onClick={() => {
                                    if (window.confirm("Khôi phục bình luận này?")) {
                                        onRestore?.(comment.Id);
                                    }
                                }}
                                className="text-gray-400 italic cursor-pointer hover:underline">
                                Đã ẩn phía người dùng(bấm để khôi phục)
                            </span>
                        ) : comment.Status === -1 ? (
                            <span
                                onClick={() => {
                                    if (window.confirm("Khôi phục bình luận này?")) {
                                        onRestore?.(comment.Id);
                                    }
                                }}
                                className="text-gray-400 italic cursor-pointer hover:underline">
                                Đã xóa(bấm để khôi phục)
                            </span>
                        ) : (
                            <>
                                <span
                                    onClick={() => onHide?.(comment.Id)}
                                    className="cursor-pointer text-yellow-600 hover:underline"
                                >
                                    Ẩn Comment
                                </span>

                                <span
                                    onClick={() => onDelete?.(comment.Id)}
                                    className="cursor-pointer text-red-600 hover:underline"
                                >
                                    Xóa Comment
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* REPLIES */}
            {hasReplies && showReplies && (
                <div className="ml-10 mt-2 border-l pl-3">
                    {replies.map((reply) => (
                        <CommentItem
                            key={reply.Id}
                            comment={reply}
                            level={level + 1}
                            onHide={onHide}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── PostDetail ───────────────────────────────────────────────────────────────

const PostDetail: React.FC<PostDetailProps> = ({ post, onClose }) => {

    console.log("comments:", post.comments);
    const mediaUrls = post.mediaUrls ?? [];
    const [likedUsers] = useState(post.likes);
    const [showComments, setShowComments] = useState(false);
    const [openLikes, setOpenLikes] = useState(false);
    const [comments, setComments] = useState<CommentDTO[]>(post.comments ?? []);



    // console.log("comments:", post.comments);
    // const mediaUrls = post.mediaUrls ?? [];
    // const [likedUsers, setLikedUsers] = useState(post.likes);
    // const [showComments, setShowComments] = useState(false);
    // const [isLiked, setIsLiked] = useState(false);
    // const [openLikes, setOpenLikes] = useState(false);
    // const [comments, setComments] = useState<CommentDTO[]>(post.comments ?? []);

    // const currentUser = { UserId: "0", UserName: "Bạn", Avatar: "", Type: "like" };

    // const handleLike = () => {
    //     if (isLiked) {
    //         setLikedUsers(likedUsers.filter(u => u.UserId !== currentUser.UserId));
    //     } else {
    //         setLikedUsers([...likedUsers, currentUser]);
    //     }
    //     setIsLiked(!isLiked);
    // };

    // // load lại comment khi thay đổi comment cha thì cập nhật và hiện sự thay đổi của comment con 
    // const loadComments = async () => {
    //     try {
    //         const data = await commentService.getByPost(Number(post.id)); // cần đổi endpoind mới để đọc tất cả status của toàn bộ comment của bài post
    //         setComments(data);
    //     } catch (err) {
    //         console.error("Load comment lỗi:", err);
    //     }
    // };

    // cập nhât status comment cho giao diện dùng api gọi load lại dữ liệu 
    // const updateCommentStatus = (
    //     list: CommentDTO[],
    //     id: number,
    //     status: number
    // ): CommentDTO[] => {
    //     return list.map(c => {
    //         if (c.Id === id) {
    //             return {
    //                 ...c,
    //                 Status: status,
    //                 Content:
    //                     status === 0
    //                         ? "Bình luận đã bị ẩn"
    //                         : status === -1
    //                             ? "Bình luận đã bị xóa"
    //                             : c.Content
    //             };
    //         }

    //         if (c.Replies?.length) {
    //             return {
    //                 ...c,
    //                 Replies: updateCommentStatus(c.Replies, id, status)
    //             };
    //         }

    //         return c;
    //     });
    // };

    // dùng cho ép đổi status comment con theo cha bằng ui không dùng gọi api load dữ liệu từ db
    const updateCommentStatus = (
        list: CommentDTO[],
        id: number,
        status: number
    ): CommentDTO[] => {

        const updateRecursive = (comment: CommentDTO, forceStatus?: number): CommentDTO => {
            // Nếu là comment bị click → set forceStatus
            const isTarget = comment.Id === id;
            const newStatus = isTarget ? status : forceStatus ?? (comment.Status ?? 1);

            return {
                ...comment,
                Status: newStatus,
                // nếu cha bị đổi → ép toàn bộ con theo
                Replies: comment.Replies?.map(r =>
                    updateRecursive(r, newStatus)
                ) || []
            };
        };

        return list.map(c => updateRecursive(c));
    };

    // khôi phục stutus sau khi ẩn/ xóa
    const handleRestoreComment = async (id: number) => {
        try {
            await commentService.updateStatus(id, 1);

            setComments(prev =>
                updateCommentStatus(prev, id, 1)
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleHideComment = async (id: number) => {
        const ok = window.confirm("Bạn có chắc muốn ẩn bình luận này không?");
        if (!ok) return;
        try {
            await commentService.updateStatus(id, 0);

            setComments(prev =>
                updateCommentStatus(prev, id, 0)
            );

            //await loadComments(); // optional
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteComment = async (id: number) => {
        const ok = window.confirm("Bạn có chắc muốn xóa bình luận này không?");
        if (!ok) return;
        try {
            await commentService.updateStatus(id, -1);

            setComments(prev =>
                updateCommentStatus(prev, id, -1)
            );

            //await loadComments(); // optional
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        //loadComments(); // thực hiện load lại trạng thái cả comment cha và con ngay khi cập nhật trạng thái cha

        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "auto"; };
    }, []);

    // ✅ Build tree an toàn — xử lý cả flat list lẫn tree từ API
    const commentTree = comments;
    const getReactionIcon = (type?: string) => {
        switch (type?.toLowerCase()) {
            case "love": return "❤️";
            case "haha": return "😂";
            case "wow": return "😮";
            case "sad": return "😢";
            case "angry": return "😡";
            default: return "👍";
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl w-full max-w-2xl p-6 relative shadow-lg"
                onClick={e => e.stopPropagation()}
            >
                {/* Close */}
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    {post.authorAvatar
                        ? <img src={post.authorAvatar} className="w-12 h-12 rounded-full object-cover" />
                        : <div className="w-12 h-12 rounded-full bg-blue-500 text-[var(--color-text)] flex items-center justify-center">{post.author.charAt(0)}</div>
                    }
                    <div>
                        <p className="font-semibold">{post.author}</p>
                        <p className="text-sm text-gray-500">
                            {new Date(new Date(post.createdAt).getTime() + 7 * 60 * 60 * 1000).toLocaleString()}
                        </p>                    </div>
                </div>

                {/* Content */}
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
                {/* Shared Post */}
                {post.SharedPost && (
                    <div className="border rounded-lg p-3 bg-gray-100 mb-4 max-h-[300px] overflow-y-auto">

                        {/* HEADER */}
                        <div className="flex items-center gap-2 mb-2">
                            {post.SharedPost.authorAvatar ? (
                                <img
                                    src={post.SharedPost.authorAvatar}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
                                    {post.SharedPost.author.charAt(0)}
                                </div>
                            )}

                            <div className="flex flex-col">
                                <span className="font-semibold text-sm">
                                    {post.SharedPost.author}
                                </span>

                                <span className="text-xs text-gray-500">
                                    {new Date(new Date(post.SharedPost.createdAt).getTime() + 7 * 60 * 60 * 1000).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* TITLE */}
                        {post.SharedPost.title && (
                            <h4 className="font-bold mb-1">
                                {post.SharedPost.title}
                            </h4>
                        )}

                        {/* CONTENT */}
                        <p className="text-gray-700 whitespace-pre-wrap mb-2">
                            {post.SharedPost.content}
                        </p>

                        {/* MEDIA */}
                        {post.SharedPost?.mediaUrls && post.SharedPost?.mediaUrls.length > 0 && (
                            <MediaGrid mediaUrls={post.SharedPost.mediaUrls} />
                        )}
                    </div>
                )}

                {/* MediaGrid */}
                {mediaUrls.length > 0 && (
                    <div className="max-h-[250px] overflow-y-auto scroll-smooth">
                        <MediaGrid mediaUrls={mediaUrls} />
                    </div>
                )}

                {/* Stats */}
                <div className="flex justify-between border-b pb-3 mb-3 text-sm text-gray-500">
                    <span className="cursor-pointer hover:underline"
                        onClick={() => { setOpenLikes(!openLikes); setShowComments(false); }}>
                        {likedUsers.length} lượt thích
                    </span>
                    <span className="cursor-pointer hover:underline"
                        onClick={() => { setShowComments(!showComments); setOpenLikes(false); }}>
                        {post.countComment} bình luận
                    </span>
                </div>

                {/* ── Comments ── */}
                {showComments && (
                    <div className=" mb-3 bg-white border rounded-xl shadow-sm max-h-50 overflow-y-auto">
                        {commentTree.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">
                                Chưa có bình luận
                            </p>
                        ) : (
                            commentTree.map(comment => (
                                <CommentItem
                                    key={comment.Id}
                                    comment={comment}
                                    onHide={handleHideComment}
                                    onDelete={handleDeleteComment}
                                    onRestore={handleRestoreComment} />

                            ))
                        )}
                    </div>
                )}

                {/* ── Likes ── */}
                {openLikes && (
                    <div className="mb-3 bg-white border rounded-xl shadow-sm max-h-50 overflow-y-auto">
                        {likedUsers.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">Chưa có lượt thích</p>
                        ) : (
                            likedUsers.map(u => {
                                const name = u.UserName || "Unknown";
                                return (
                                    <div key={u.UserId}
                                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-[var(--color-text)] overflow-hidden">
                                                {u.Avatar
                                                    ? <img
                                                        src={getFullImageUrl(u.Avatar)}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    : (name || "").charAt(0).toUpperCase()
                                                }
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-800">{name}</span>
                                                <span className="text-xs text-gray-500">Đã bày tỏ cảm xúc</span>
                                            </div>
                                        </div>
                                        <div className="text-lg">{getReactionIcon(u.Type)}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostDetail;
