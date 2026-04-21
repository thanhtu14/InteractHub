import React, { useState, useEffect } from "react";
import Post from "./Post";
import { postService, type PostItem } from "../services/postService";
import type { SortOrder, StatusFilter } from "./PostFilterBar";

// Interface dành riêng cho hiển thị tại UI
export interface PostData {
  id: string | number;
  userId?: string;
  fullName: string;
  authorAvatar?: string;
  title?: string;
  content: string;
  status?: number;
  mediaUrls: string[];
  createdAt: string;
}

interface PostListProps {
  userId?: string | number | null;
  sort?: SortOrder;
  statusFilter?: StatusFilter;
  isOwnProfile?: boolean;
  isFriend?: boolean;
}

/**
 * Mapper: Chuyển đổi từ kiểu dữ liệu Service (PostItem) sang kiểu dữ liệu UI (PostData)
 * Đảm bảo khớp với các field bạn đã đặt tên trong Component Post.tsx
 */
const mapPostItemToPostData = (post: PostItem): PostData => ({
  id: post.id,
  userId: post.userId,
  fullName: post.authorName ?? "Người dùng InteractHub",
  authorAvatar: post.authorAvatar,
  title: post.title,
  content: post.content ?? "",
  status: post.status,
  mediaUrls: post.mediaUrls ?? [],
  createdAt: post.createdAt ?? new Date().toISOString(),
});

const PostList: React.FC<PostListProps> = ({
  userId = null,
  sort = "newest",
  statusFilter = "all",
  isOwnProfile = false,
  isFriend = false,
}) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        /**
         * LOGIC QUAN TRỌNG: 
         * 1. Nếu không có userId (Trang chủ): Gọi getAllPosts()
         * 2. Nếu có userId (Trang cá nhân): Gọi getPostsByUserId()
         */
        const response = (userId && userId !== "null")
          ? await postService.getPostsByUserId(String(userId))
          : await postService.getAllPosts();

        // postService đã thực hiện mapPost(res.data.Data) nên response.data là PostItem[]
        let data = response.data.map(mapPostItemToPostData);

        // ── 1. Lọc theo quyền xem (Privacy) ──────────────────────────
        // Chỉ áp dụng lọc thủ công ở FE khi xem Profile của người khác.
        // Trên Newsfeed (userId = null), Backend thường đã lọc sẵn bài Public.
        if (userId && !isOwnProfile) {
          data = data.filter((p) => {
            if (p.status === 1) return true;             // Công khai: Hiện cho tất cả
            if (p.status === 2 && isFriend) return true;    // Bạn bè: Hiện nếu là bạn
            return false;                                 // Riêng tư: Ẩn
          });
        }

        // ── 2. Lọc theo thanh FilterBar (nếu có) ─────────────────────
        if (statusFilter !== "all") {
          data = data.filter((p) => String(p.status) === statusFilter);
        }

        // ── 3. Sắp xếp thời gian ─────────────────────────────────────
        data = data.sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          return sort === "oldest" ? timeA - timeB : timeB - timeA;
        });

        setPosts(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách bài viết:", err);
        setError("Không thể tải bài viết vào lúc này.");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId, sort, statusFilter, isOwnProfile, isFriend]);

  // Giao diện khi đang tải (Skeleton)
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="h-80 w-full bg-[#242526] rounded-xl border border-gray-800 animate-pulse" 
          />
        ))}
      </div>
    );
  }

  // Giao diện khi gặp lỗi
  if (error) {
    return (
      <div className="text-center py-10 bg-[#242526] rounded-xl border border-gray-800">
        <p className="text-red-400 font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 text-blue-500 hover:underline text-sm"
        >
          Thử tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.length > 0 ? (
        posts.map((post) => (
          <Post key={post.id} post={post} />
        ))
      ) : (
        <div className="text-center py-20 bg-[#242526] rounded-xl border border-gray-800">
          <p className="text-gray-500 text-lg">Chưa có bài viết nào để hiển thị.</p>
          <p className="text-gray-600 text-sm mt-1">Hãy đăng bài hoặc kết bạn để xem thêm nội dung.</p>
        </div>
      )}
    </div>
  );
};

export default PostList;