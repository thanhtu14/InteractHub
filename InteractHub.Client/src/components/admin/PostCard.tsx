import React from 'react';
import { Eye, Heart, MessageSquare, Flag } from 'lucide-react';
import StatusBadge from './StatusBadge';
import TypeBadge from './TypeBadge';
import PostActions from './PostActions';

interface Post {
    id: number;
    author: string;
    authorAvatar: string;
    title: string;
    content: string;
    type: 'article' | 'tutorial' | 'guide' | 'post';
    views: number;
    likes: number;
    comments: number;
    status: 'published' | 'pending' | 'flagged' | 'removed';
    createdAt: string;
    hasReports: boolean;
}

interface PostCardProps {
    post: Post;
    onApprove?: (id: number) => void;
    onReject?: (id: number) => void;
    onRestore?: (id: number) => void;
    onDelete?: (id: number) => void;
    onViewDetail: (id: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({
    post,
    onApprove,
    onReject,
    onRestore,
    onDelete,
    onViewDetail
}) => {
    return (
        <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {post.authorAvatar}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{post.title}</h3>
                                {post.hasReports && <Flag className="w-4 h-4 text-red-500" />}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>{post.author}</span>
                                <span>•</span>
                                <span>{post.createdAt}</span>
                                <span>•</span>
                                <TypeBadge type={post.type} />
                            </div>
                        </div>
                        <StatusBadge status={post.status} type="post" />
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.content}</p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {post.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {post.likes}
                            </span>
                            <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {post.comments}
                            </span>
                        </div>

                        <PostActions
                            post={post}
                            onApprove={onApprove}
                            onReject={onReject}
                            onRestore={onRestore}
                            onDelete={onDelete}
                            onViewDetail={onViewDetail}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;