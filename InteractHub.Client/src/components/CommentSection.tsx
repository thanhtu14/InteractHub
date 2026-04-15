import React, { useState, useEffect } from "react";
import Comment from "./Comment";
import { commentService, type CommentResponse } from "../services/commetService";

interface CommentSectionProps {
  postId: number;
  onClose: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, onClose }) => {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách bình luận
  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await commentService.getByPost(postId);
        if (res.Success && res.Data) {
          console.log("Dữ liệu bình luận từ API:", res.Data);
          setComments(res.Data);
        } else {
          setError(res.Message || "Không thể tải bình luận");
        }
      } catch (err) {
        console.error(err);
        setError("Không thể tải bình luận.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  // Thêm bình luận mới (cấp 1)
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await commentService.create({
        PostId: postId,
        Content: newComment.trim(),
        ParentId: null,
      });

      if (res.Success && res.Data) {
        // Thêm comment mới vào đầu danh sách (giống Facebook)
        setComments((prev) => [res.Data!, ...prev]);
        setNewComment("");
      } else {
        alert(res.Message || "Không thể đăng bình luận");
      }
    } catch (err) {
      console.error("Lỗi gửi bình luận:", err);
      alert("Đã xảy ra lỗi khi gửi bình luận.");
    }
  };

  // Callback khi có reply mới được thêm (từ component Comment con)
  const handleReplyAdded = (newReply: CommentResponse) => {
    // Hiện tại component Comment đã tự thêm reply vào cây, 
    // nên ta không cần làm gì thêm ở đây (đã xử lý recursive)
    // Nếu muốn refresh toàn bộ thì có thể gọi lại fetchComments()
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
      <div className="bg-[#242526] w-[450px] rounded-2xl p-5 shadow-2xl relative border border-[#3e4042]">
        
        {/* Nút đóng */}
        <button
          className="absolute top-4 right-4 text-gray-400 text-xl hover:text-white transition-colors"
          onClick={onClose}
        >
          ✖
        </button>

        {/* Tiêu đề */}
        <div className="text-center border-b border-[#3e4042] pb-4 mb-4">
          <h3 className="text-lg font-bold text-white">Bình luận</h3>
        </div>

        {/* Danh sách comment */}
        <div className="max-h-[420px] overflow-y-auto mb-6 space-y-1 pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#1877f2]"></div>
            </div>
          ) : error ? (
            <p className="text-center text-red-500 py-4">{error}</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-500 italic py-8">Chưa có bình luận nào</p>
          ) : (
            comments.map((comment) => (
              <Comment
                key={comment.Id}
                comment={comment}
                postId={postId}                    // ← Truyền thêm postId
                onReplyAdded={handleReplyAdded}    // ← Truyền callback
                parentUserName={comment.ParentUserName}
              />
            ))
          )}
        </div>

        {/* Input thêm comment cấp 1 */}
        <div className="flex gap-2 border-t border-[#3e4042] pt-4">
          <input
            type="text"
            placeholder="Viết bình luận..."
            className="flex-1 p-3 bg-[#3a3b3c] border border-[#4e4f50] rounded-xl
                       text-gray-200 placeholder-gray-500 focus:outline-none
                       focus:border-[#1877f2] transition-colors text-sm"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || loading}
            className="bg-[#1877f2] text-white px-6 py-2 rounded-xl font-medium
                       hover:bg-[#166fe5] disabled:opacity-50 transition-colors"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;