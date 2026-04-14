import React, { useState, useEffect } from "react";
import Post from "./Post";
import { postService, type PostItem } from "../services/postService";
import type { SortOrder, StatusFilter } from "./PostFilterBar";

export interface PostData {
  id: string | number;
  userId?: string | number;
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

const mapPostItemToPostData = (post: PostItem): PostData => ({
  id: post.id,
  userId: post.userId,
  fullName: post.authorName ?? "Ẩn danh",
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
        const res = await postService.getPostsByUserId(String(userId));
        let data = res.data.map(mapPostItemToPostData);

        // ── Lọc theo quyền xem ──────────────────────────────
        if (!isOwnProfile) {
          data = data.filter((p) => {
            if (p.status === 1) return true;          // công khai: ai cũng thấy
            if (p.status === 2 && isFriend) return true; // bạn bè: chỉ bạn thấy
            return false;                              // riêng tư: không ai thấy
          });
        }

        // ── Lọc theo statusFilter (chỉ áp dụng khi là chủ trang hoặc bạn bè) ──
        if (statusFilter !== "all") {
          data = data.filter((p) => String(p.status) === statusFilter);
        }

        // ── Sắp xếp ─────────────────────────────────────────
        data = data.sort((a, b) =>
          sort === "oldest"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setPosts(data);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách bài viết:", err);
        setError("Không thể tải bài viết. Vui lòng thử lại.");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId, sort, statusFilter, isOwnProfile, isFriend]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-[#242526] rounded-xl border border-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 py-10">{error}</p>;
  }

  return (
    <div className="space-y-4">
      {posts.length > 0 ? (
        posts.map((post) => <Post key={post.id} post={post} />)
      ) : (
        <p className="text-center text-gray-500 py-10">Chưa có bài viết nào.</p>
      )}
    </div>
  );
};

export default PostList;