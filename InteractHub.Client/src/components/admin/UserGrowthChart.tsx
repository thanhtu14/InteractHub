import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ==================== Interface ====================

interface GrowthData {
    month: string;        // Ví dụ: "Tháng 1", "Jan", "2026-01", ...
    users: number;        // Số lượng người dùng
}

interface UserGrowthChartProps {
    data: GrowthData[];   // Mảng dữ liệu tăng trưởng
}

// ==================== Component ====================

const UserGrowthChart: React.FC<UserGrowthChartProps> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Tăng trưởng người dùng</h3>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default UserGrowthChart;