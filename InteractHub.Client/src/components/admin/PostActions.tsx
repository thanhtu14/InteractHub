import React from 'react';
import { Eye, EyeOff, Trash2, RotateCcw } from 'lucide-react';

interface Post {
    id: string;
    status: 'public' | 'friend' | 'private' | 'hidden' | 'delete';
}

interface PostActionsProps {
    post: Post;
    onHide?: (id: string) => void;
    onRestore?: (id: string) => void;
    onDelete?: (id: string) => void;
    onViewDetail: (id: string) => void;
}

const PostActions: React.FC<PostActionsProps> = ({
    post,
    onHide,
    onRestore,
    onDelete,
    onViewDetail
}) => {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => onViewDetail(post.id)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1"
            >
                <Eye className="w-4 h-4" />
                Chi tiết
            </button>

            {(post.status === 'public' || post.status === 'friend' || post.status === 'private') && (
                <>
                    <button
                        onClick={() => {
                            if (window.confirm("Bạn có chắc muốn ẩn bài viết này không?")) {
                                onHide?.(post.id);
                            }
                        }}
                        className="px-3 py-1.5 bg-green-600 text-[var(--color-text)] rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <EyeOff className="w-4 h-4" />
                        Ẩn
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm("Bạn có chắc muốn xóa bài viết này không?")) {
                                onDelete?.(post.id);
                            }
                        }}
                        className="px-3 py-1.5 bg-red-600 text-[var(--color-text)] rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                    </button>
                </>
            )}

            {post.status === 'hidden' && (
                <>
                    <button
                        onClick={() => {
                            if (window.confirm("Bạn có chắc muốn khôi phục bài viết này về private ?")) {
                                onRestore?.(post.id);
                            }
                        }}
                        className="px-3 py-1.5 bg-green-600 text-[var(--color-text)] rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <Eye className="w-4 h-4 text-green-500" />
                        Bỏ ẩn
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm("Bạn có chắc muốn xóa bài viết này không?")) {
                                onDelete?.(post.id);
                            }
                        }}
                        className="px-3 py-1.5 bg-red-600 text-[var(--color-text)] rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                    </button>
                </>
            )}

            {post.status === 'delete' && (
                <>
                    <button
                        onClick={() => {
                            if (window.confirm("Bạn có chắc muốn ẩn bài viết này không?")) {
                                onHide?.(post.id);
                            }
                        }}
                        className="px-3 py-1.5 bg-green-600 text-[var(--color-text)] rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <EyeOff className="w-4 h-4" />
                        Ẩn
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm("Bạn có chắc muốn khôi phục bài viết này về private ?")) {
                                onRestore?.(post.id);
                            }
                        }}
                        className="px-3 py-1.5 bg-red-600 text-[var(--color-text)] rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <RotateCcw className="w-4 h-4 text-blue-500" />
                        Bỏ xóa
                    </button>
                </>
            )}
        </div>
    );
};

export default PostActions;