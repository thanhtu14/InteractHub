import { useState, useRef } from "react";
import { 
  FaUserCircle, 
  FaTimes, 
  FaImage, 
  FaUserFriends, 
  FaSmile, 
 
} from "react-icons/fa";

interface PostModalProps {
  user?: any;
  onClose: () => void;
}

const PostModal = ({ user, onClose }: PostModalProps) => {
  const [postContent, setPostContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setShowImageUpload(true);
    }
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim() && !image) return;

    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = storedUser?.id || 1;

      const formData = new FormData();
      formData.append("userId", userId.toString());
      formData.append("content", postContent);

      if (fileInputRef.current?.files?.[0]) {
        formData.append("image", fileInputRef.current.files[0]);
      }

      const response = await fetch("http://localhost:8080/api/posts/create", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Đăng bài thành công!");
        // Reset form
        setPostContent("");
        setImage(null);
        setShowImageUpload(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
      } else {
        alert(result.error || "Đăng bài thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      alert("Có lỗi xảy ra khi đăng bài!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-[#242526] w-full max-w-[560px] rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3e4042] px-6 py-4">
          <h3 className="text-2xl font-bold text-white">Tạo bài viết</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#3a3b3c] transition-colors"
          >
            <FaTimes size={24} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-4">
            {currentUser?.avatarUrl ? (
              <img
                src={`http://localhost:8080/uploads/${currentUser.avatarUrl}`}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-700"
              />
            ) : (
              <FaUserCircle size={48} className="text-gray-400" />
            )}
            <div>
              <p className="font-semibold text-white text-lg">
                {currentUser?.fullName || currentUser?.username || "Người dùng"}
              </p>
              <p className="text-gray-400 text-sm">Công khai</p>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            placeholder="Bạn đang nghĩ gì?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="w-full h-40 bg-transparent text-white text-[20px] placeholder-gray-400 
                       resize-none focus:outline-none"
          />

          {/* Image Upload Area */}
          {showImageUpload && (
            <div className="relative mt-4 border-2 border-dashed border-gray-600 rounded-2xl min-h-[320px] flex items-center justify-center overflow-hidden bg-[#1a1a1a]">
              {image ? (
                <img
                  src={image}
                  alt="preview"
                  className="max-h-[320px] max-w-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-center">
                  <FaImage size={50} className="text-green-500 mx-auto mb-3" />
                  <p className="text-gray-400">Thêm ảnh vào bài viết</p>
                </div>
              )}

              {/* Close image button */}
              <button
                onClick={() => {
                  setShowImageUpload(false);
                  setImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full"
              >
                <FaTimes size={20} />
              </button>
            </div>
          )}

          {/* Add to post options */}
          <div className="mt-6 border border-gray-600 rounded-2xl p-4">
            <p className="text-white font-medium mb-3">Thêm vào bài viết của bạn</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setShowImageUpload(true)}
                className="flex flex-col items-center justify-center py-4 hover:bg-[#3a3b3c] rounded-xl transition-all"
              >
                <FaImage size={28} className="text-green-500 mb-1" />
                <span className="text-sm text-gray-300">Ảnh/Video</span>
              </button>

              <button className="flex flex-col items-center justify-center py-4 hover:bg-[#3a3b3c] rounded-xl transition-all">
                <FaUserFriends size={28} className="text-blue-500 mb-1" />
                <span className="text-sm text-gray-300">Gắn thẻ</span>
              </button>

              <button className="flex flex-col items-center justify-center py-4 hover:bg-[#3a3b3c] rounded-xl transition-all">
                <FaSmile size={28} className="text-yellow-500 mb-1" />
                <span className="text-sm text-gray-300">Cảm xúc</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-4 border-t border-[#3e4042]">
          <button
            onClick={handlePostSubmit}
            disabled={(!postContent.trim() && !image) || loading}
            className="w-full bg-[#1877f2] hover:bg-[#166fe0] disabled:bg-gray-600 
                       text-white font-semibold py-3 rounded-2xl text-lg transition-all"
          >
            {loading ? "Đang đăng..." : "Đăng"}
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
};

export default PostModal;