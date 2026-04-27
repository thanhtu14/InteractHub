import React, { useState, useEffect, useRef, useCallback } from "react";
import Post from "./Post";
import { postService, type PostItem } from "../services/postService";
import type { SortOrder, StatusFilter } from "./PostFilterBar";

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
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isHomePage = !userId || userId === "null";

  const fetchPosts = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      if (!isHomePage) {
        // ── Trang Profile: load 1 lần, lọc ở FE ──────────────────
        const response = await postService.getPostsByUserId(String(userId));
        let data = response.data.map(mapPostItemToPostData);

        // Lọc theo quyền xem
        if (!isOwnProfile) {
          data = data.filter((p) => {
            if (p.status === 1) return true;
            if (p.status === 2 && isFriend) return true;
            return false;
          });
        }

        // Lọc theo FilterBar
        if (statusFilter !== "all") {
          data = data.filter((p) => String(p.status) === statusFilter);
        }

        // Sắp xếp
        data = data.sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          return sort === "oldest" ? timeA - timeB : timeB - timeA;
        });

        setPosts(data);
        setHasMore(false);
      } else {
        // ── Homepage: pagination + infinite scroll ────────────────
        const currentPage = reset ? 1 : pageRef.current;
        const response = await postService.getHomeFeed(currentPage);
        const newPosts = response.data.posts.map(mapPostItemToPostData);

        setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
        setHasMore(response.data.hasMore);
        pageRef.current = currentPage + 1;
      }
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bài viết:", err);
      setError("Không thể tải bài viết vào lúc này.");
      if (reset) setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [userId, sort, statusFilter, isOwnProfile, isFriend, isHomePage, loading]);

  // Reset khi filter/sort/userId thay đổi
  useEffect(() => {
    pageRef.current = 1;
    setHasMore(true);
    setPosts([]);
    fetchPosts(true);
  }, [userId, sort, statusFilter, isOwnProfile, isFriend]);

  // Sentinel observer — chỉ dùng cho Homepage
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!isHomePage) return;

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchPosts();
      }
    }, { threshold: 0.1 });

    if (node) observerRef.current.observe(node);
  }, [isHomePage, hasMore, loading, fetchPosts]);

  // Skeleton load lần đầu
  if (loading && posts.length === 0) {
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

  if (error && posts.length === 0) {
    return (
      <div className="text-center py-10 bg-[#242526] rounded-xl border border-gray-800">
        <p className="text-red-400 font-medium">{error}</p>
        <button
          onClick={() => fetchPosts(true)}
          className="mt-4 text-blue-500 hover:underline text-sm"
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.length > 0 ? (
        posts.map((post) => <Post key={post.id} post={post} />)
      ) : (
        !loading && (
          <div className="text-center py-20 bg-[#242526] rounded-xl border border-gray-800">
            <p className="text-gray-500 text-lg">Chưa có bài viết nào để hiển thị.</p>
            <p className="text-gray-600 text-sm mt-1">
              Hãy đăng bài hoặc kết bạn để xem thêm nội dung.
            </p>
          </div>
        )
      )}

      {/* Skeleton khi load thêm (infinite scroll) */}
      {loading && posts.length > 0 && (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-80 w-full bg-[#242526] rounded-xl border border-gray-800 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Sentinel element */}
      {isHomePage && !loading && hasMore && (
        <div ref={sentinelRef} className="h-4" />
      )}

      {/* Hết bài */}
      {isHomePage && !hasMore && posts.length > 0 && (
        <p className="text-center text-gray-500 text-sm py-6">
          Bạn đã xem hết bài viết 🎉
        </p>
      )}
    </div>
  );
};

export default PostList;