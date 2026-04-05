import React, { useState } from "react";
// import axios from "axios";
import Post from "./Post";

export interface PostData {
  id: string | number;
  userId?: string | number;
  fullName: string;
  avatarUrl?: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
}

interface PostListProps {
  userId?: string | number | null;
}

// 🔧 MOCK posts — xóa khi có BE
const MOCK_POSTS: PostData[] = [
  {
    id: 1,
    userId: 1,
    fullName: "Bùi Gia Quang Vinh",
    avatarUrl: "https://i.pravatar.cc/150?u=vinh",
    content: "Chào mọi người! Đây là bài viết đầu tiên 🎉",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 2,
    fullName: "Minh Thu",
    avatarUrl: "https://i.pravatar.cc/150?u=thu",
    content: "Hôm nay thời tiết đẹp quá 🌤️ Ra ngoài đi thôi mọi người ơi!",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 3,
    userId: 3,
    fullName: "Quốc Anh",
    avatarUrl: "https://i.pravatar.cc/150?u=anh",
    content: "Vừa hoàn thành dự án React đầu tiên 🚀 Cảm ơn mọi người đã hỗ trợ!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 4,
    userId: 4,
    fullName: "Hồng Nhung",
    avatarUrl: "https://i.pravatar.cc/150?u=nhung",
    content: "Cuối tuần rồi, ai có kế hoạch gì chưa? 😄",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

const PostList: React.FC<PostListProps> = ({ userId = null }) => {
  // 🔧 MOCK: lọc theo userId nếu có, thay vì fetch BE
  // useEffect(() => {
  //   const fetchPosts = async () => {
  //     setLoading(true);
  //     const url = userId
  //       ? `http://localhost:8080/api/posts/user/${userId}`
  //       : `http://localhost:8080/api/posts`;
  //     try {
  //       const response = await axios.get<PostData[]>(url);
  //       setPosts(response.data || []);
  //     } catch (error) {
  //       console.error("Lỗi khi lấy danh sách bài viết:", error);
  //       setPosts([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchPosts();
  // }, [userId]);

  const [loading] = useState(false);
  const posts = userId
    ? MOCK_POSTS.filter((p) => String(p.userId) === String(userId))
    : MOCK_POSTS;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-64 bg-[#242526] rounded-xl border border-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
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