import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ==================== Interface ====================

interface PieDataItem {
    name: string;      // Tên phân loại (ví dụ: "Spam", "Hợp lệ", "Khiếu nại")
    value: number;     // Giá trị số lượng hoặc tỷ lệ
    color: string;     // Màu sắc của phần pie
}

interface ReportPieChartProps {
    data: PieDataItem[];   // Mảng dữ liệu cho biểu đồ tròn
}

// ==================== Component ====================

const ReportPieChart: React.FC<ReportPieChartProps> = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold mb-4">Phân loại Reports</h3>

            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        outerRadius={100}
                        label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ReportPieChart;