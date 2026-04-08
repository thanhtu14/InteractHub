import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

// ==================== Interface ====================

interface PostActivityData {
    day: string;           // Ví dụ: "Thứ 2", "01/04", "Week 1", ...
    posts: number;
    comments: number;
    likes: number;
}

interface PostActivityChartProps {
    data: PostActivityData[];
}

// ==================== Component ====================

const PostActivityChart: React.FC<PostActivityChartProps> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Hoạt động bài viết</h3>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />

                    <Bar dataKey="posts" fill="#3b82f6" name="Bài viết" />
                    <Bar dataKey="comments" fill="#10b981" name="Bình luận" />
                    <Bar dataKey="likes" fill="#f59e0b" name="Lượt thích" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PostActivityChart;