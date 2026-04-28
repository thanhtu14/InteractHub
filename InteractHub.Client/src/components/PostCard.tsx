import React from "react";

interface PostCardProps {
  url: string;
  title?: string;
}

const PostCard: React.FC<PostCardProps> = ({ url, title }) => {
  // Hàm xử lý khi click vào card để không làm ảnh hưởng đến sự kiện click của tin nhắn
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="block bg-[#242526] border border-[#4e4f50] rounded-xl overflow-hidden hover:bg-[#303132] transition-all no-underline group"
    >
      <div className="w-full p-3 border-[#1877f2] group-hover:border-blue-400 transition-colors">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 bg-[#1877f2] rounded-full flex items-center justify-center">
             <span className="text-[10px] text-white">🔗</span>
          </div>
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
            Bài viết từ InteractHub
          </p>
        </div>
        
        <p className="text-[14px] text-gray-100 font-medium line-clamp-2 leading-relaxed">
          {title || "Nhấn để xem chi tiết bài viết này"}
        </p>
        
        <div className="mt-2 pt-2 border-t border-[#3e4042] flex items-center justify-between">
          <p className="text-[10px] text-gray-500 truncate max-w-[180px]">
            {url.replace(/^https?:\/\//, '')}
          </p>
          <span className="text-[10px] text-blue-400 font-bold group-hover:underline">
            XEM NGAY
          </span>
        </div>
      </div>
    </a>
  );
};

export default PostCard;