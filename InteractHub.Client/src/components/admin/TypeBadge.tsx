import React from 'react';

interface TypeBadgeProps {
    type: 'article' | 'tutorial' | 'guide' | 'post';
}

const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
    const labels: Record<string, string> = {
        article: 'Bài viết',
        tutorial: 'Hướng dẫn',
        guide: 'Chỉ dẫn',
        post: 'Bài đăng',
    };

    return (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
            {labels[type]}
        </span>
    );
};

export default TypeBadge;