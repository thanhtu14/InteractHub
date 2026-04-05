import React, { useState } from "react";
// import axios from "axios";
import Comment from "./Comment";

interface CommentObj {
  id: number;
  userName: string;
  content: string;
  avatarUrl?: string;
}

interface CommentSectionProps {
  postId: number | string;
  onClose: () => void;
}

// 🔧 MOCK comments — xóa khi có BE
const MOCK_COMMENTS: CommentObj[] = [
  {
    id: 1,
    userName: "Minh Thu",
    avatarUrl: "https://i.pravatar.cc/150?u=thu",
    content: "Bài viết hay quá! 🔥",
  },
  {
    id: 2,
    userName: "Quốc Anh",
    avatarUrl: "https://i.pravatar.cc/150?u=anh",
    content: "Đồng ý với bạn 100% 😄",
  },
  {
    id: 3,
    userName: "Hồng Nhung",
    avatarUrl: "https://i.pravatar.cc/150?u=nhung",
    content: "Cho mình hỏi thêm về vấn đề này được không?",
  },
];

// 🔧 MOCK user — thay vì đọc từ localStorage (cần BE auth)
// const user = JSON.parse(localStorage.getItem("user") || "null");
const MOCK_USER = {
  id: 1,
  username: "Bùi Gia Quang Vinh",
  avatarUrl: "https://i.pravatar.cc/150?u=vinh",
};

const CommentSection: React.FC<CommentSectionProps> = ({ postId, onClose }) => {
  // 🔧 MOCK: khởi tạo comments từ mock data thay vì fetch BE
  // useEffect(() => {
  //   axios.get(`http://localhost:8080/api/comments/${postId}`)
  //     .then(response => setComments(response.data))
  //     .catch(error => console.error("Lỗi lấy bình luận:", error));
  // }, [postId]);
  const [comments, setComments] = useState<CommentObj[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState<string>("");

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    // 🔧 MOCK: thêm comment locally thay vì POST lên BE
    // axios.post("http://localhost:8080/api/comments/add", {
    //   postId,
    //   userId: user.id,
    //   content: newComment,
    // }).then(response => {
    //   setComments((prev) => [...prev, response.data]);
    //   setNewComment("");
    // }).catch(error => console.error("Lỗi gửi bình luận:", error));

    const newObj: CommentObj = {
      id: Date.now(),
      userName: MOCK_USER.username,
      avatarUrl: MOCK_USER.avatarUrl,
      content: newComment.trim(),
    };
    setComments((prev) => [...prev, newObj]);
    setNewComment("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000]">
      <div className="bg-[#242526] w-[400px] rounded-2xl p-5 shadow-2xl relative border border-[#3e4042]">

        {/* Nút đóng */}
        <button
          className="absolute top-[10px] right-[10px] text-gray-400 text-[18px]
                     cursor-pointer hover:text-white transition-colors"
          onClick={onClose}
        >
          ✖
        </button>

        {/* Tiêu đề */}
        <div className="text-center border-b border-[#3e4042] mb-4">
          <h3 className="text-lg font-bold text-white mb-2">Bình luận</h3>
        </div>

        {/* Danh sách comment */}
        <div className="max-h-[300px] overflow-y-auto min-h-[100px] mb-4 space-y-2 pr-1">
          {comments.length === 0 ? (
            <p className="text-center text-gray-500 italic">Chưa có bình luận nào</p>
          ) : (
            comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))
          )}
        </div>

        {/* Input thêm comment */}
        <div className="flex gap-2 border-t border-[#3e4042] pt-4">
          <input
            type="text"
            placeholder="Viết bình luận..."
            className="flex-1 p-2 bg-[#3a3b3c] border border-[#4e4f50] rounded-lg
                       text-gray-200 placeholder-gray-500 focus:outline-none
                       focus:border-[#1877f2] transition-colors text-sm"
            value={newComment}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewComment(e.target.value)
            }
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="bg-[#1877f2] text-white px-4 py-2 rounded-lg font-medium
                       hover:bg-[#166fe5] disabled:opacity-30 transition-colors text-sm"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;