import React from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PostActions from './PostActions';

interface Post {
    id: string;
    author: string;
    authorAvatar: string;
    title: string;
    content: string;
    countLike: number;
    likes: { UserId: string; UserName: string; Avatar: string; Type?: string }[];
    countComment: number;
    comments: CommentDTO[];
    status: 'public' | 'friend' | 'private' | 'hidden' | 'delete';
    createdAt: string;
    mediaUrls?: string[];
    SharedPost?: Post | null;

}

interface CommentDTO {
    Id: number;
    Content: string;
    UserId: string;
    UserName: string;
    UserAvatar?: string | null;
    PostId: number;
    ParentId?: number | null;
    ParentUserName?: string | null;
    Status?: number | null;
    CreatedAt?: string | null;
    LikeCount: number;
    IsLikedByCurrentUser: boolean;
    Replies: CommentDTO[];
}

interface PostCardProps {
    post: Post;
    onHide?: (id: string) => void;
    onRestore?: (id: string) => void;
    onDelete?: (id: string) => void;
    onViewDetail: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
    post,
    onHide,
    onRestore,
    onDelete,
    onViewDetail
}) => {
    return (
        <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex gap-4">

                {/* Avatar */}
                {post.authorAvatar ? (
                    <img
                        src={post.authorAvatar}
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[var(--color-text)] font-semibold">
                        {post.author.charAt(0)}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                    {post.SharedPost
                                        ? "Đã chia sẻ 1 bài viết"
                                        : post.title}
                                </h3>

                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>{post.author}</span>
                                <span>•</span>
                                <span>
                                    {new Date(new Date(post.createdAt).getTime() + 7 * 60 * 60 * 1000).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <StatusBadge status={post.status} type="post" />
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {post.content}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-gray-500">

                            <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {post.countLike}
                            </span>

                            <span className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {post.countComment}
                            </span>
                        </div>

                        <PostActions
                            post={post}
                            onHide={onHide}
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