import React from 'react';
import { Eye, CheckCircle, X, Trash2 } from 'lucide-react';

interface Post {
    id: number;
    status: 'published' | 'pending' | 'flagged' | 'removed';
}

interface PostActionsProps {
    post: Post;
    onApprove?: (id: number) => void;
    onReject?: (id: number) => void;
    onRestore?: (id: number) => void;
    onDelete?: (id: number) => void;
    onViewDetail: (id: number) => void;
}

const PostActions: React.FC<PostActionsProps> = ({
    post,
    onApprove,
    onReject,
    onRestore,
    onDelete,
    onViewDetail
}) => {
    return (
        <div className="flex items-center gap-2">
            {post.status === 'pending' && (
                <>
                    <button
                        onClick={() => onApprove?.(post.id)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Phê duyệt
                    </button>
                    <button
                        onClick={() => onReject?.(post.id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <X className="w-4 h-4" />
                        Từ chối
                    </button>
                </>
            )}

            {post.status === 'flagged' && (
                <>
                    <button
                        onClick={() => onRestore?.(post.id)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Khôi phục
                    </button>
                    <button
                        onClick={() => onDelete?.(post.id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1"
                    >
                        <Trash2 className="w-4 h-4" />
                        Xóa vĩnh viễn
                    </button>
                </>
            )}

            <button
                onClick={() => onViewDetail(post.id)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-1"
            >
                <Eye className="w-4 h-4" />
                Chi tiết
            </button>
        </div>
    );
};

export default PostActions;