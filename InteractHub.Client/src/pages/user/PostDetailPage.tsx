import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Post from "../../components/Post";
import { postService, type PostItem } from "../../services/postService";

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState<PostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Tự động mở comment section nếu URL có hash #comment-xxx
  const autoOpenComments = location.hash.includes("comment-");

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const fetchPost = async () => {
      try {
        const res = await postService.getPostById(Number(id));
        setPost(res.data);
      } catch {
        setError("Không tìm thấy bài viết.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-[#18191a]">
      <main className="max-w-[680px] mx-auto pt-20 px-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#1877f2] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-[#1877f2] text-white rounded-lg font-semibold hover:bg-[#166fe5]"
            >
              Quay lại
            </button>
          </div>
        ) : post ? (
          <>
            <button
              onClick={() => navigate(-1)}
              className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              ← Quay lại
            </button>
            <Post
              post={{
                id: post.id,
                userId: post.userId,
                fullName: post.authorName ?? "Người dùng",
                authorAvatar: post.authorAvatar,
                title: post.title,
                content: post.content ?? "",
                mediaUrls: post.mediaUrls,
                createdAt: post.createdAt ?? "",
                status: post.status,
              }}
              autoOpenComments={autoOpenComments} // ✅
            />
          </>
        ) : null}
      </main>
    </div>
  );
};

export default PostDetailPage;