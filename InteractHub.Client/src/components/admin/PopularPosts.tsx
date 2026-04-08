import React from "react";

// ==================== Interface ====================

interface PopularPost {
    title: string;
    views: number;
}

const PopularPosts: React.FC = () => {
    const posts: PopularPost[] = [
        { title: "React cơ bản", views: 1000 },
        { title: "JS nâng cao", views: 800 },
    ];

    return (
        <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Bài viết phổ biến</h3>

            <div className="space-y-4">
                {posts.map((post, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <p className="font-medium text-gray-900 line-clamp-1 pr-4">
                            {post.title}
                        </p>
                        <small className="text-gray-500 whitespace-nowrap font-medium">
                            {post.views.toLocaleString()} views
                        </small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PopularPosts;