
import React, { useEffect, useState } from "react";

// Import các component con
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";

import StatsCards from "../../components/admin/StatsCards";
import UserGrowthChart from "../../components/admin/UserGrowthChart";
import ReportPieChart from "../../components/admin/ReportPieChart";
import PostActivityChart from "../../components/admin/PostActivityChart";
import RecentUsers from "../../components/admin/RecentUsers";
import PopularPosts from "../../components/admin/PopularPosts";

// Import icon
import { Users, FileText, AlertCircle, Eye } from "lucide-react";

// ==================== Interfaces ====================

interface StatItem {
    title: string;
    value: string | number;
    change: string;
    trend: "up" | "down";
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

interface GrowthData {
    month: string;
    users: number;
}

interface ReportData {
    name: string;
    value: number;
    color: string;
}

interface PostActivityData {
    day: string;
    posts: number;
    comments: number;
    likes: number;
}

const Dashboard = () => {
    // State quản lý dữ liệu
    const [stats, setStats] = useState<StatItem[]>([]);
    const [userGrowthData, setUserGrowthData] = useState<GrowthData[]>([]);
    const [reportData, setReportData] = useState<ReportData[]>([]);
    const [postActivityData, setPostActivityData] = useState<PostActivityData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Giả lập gọi API (có độ trễ để giống thật)
        const fetchDashboardData = async () => {
            setLoading(true);

            // Giả lập thời gian tải dữ liệu
            await new Promise(resolve => setTimeout(resolve, 800));

            // Dữ liệu cho StatsCards
            const statsData: StatItem[] = [
                {
                    title: "Users",
                    value: "12,450",
                    change: "+12.5%",
                    trend: "up",
                    icon: Users,
                    color: "bg-blue-500",
                },
                {
                    title: "Posts",
                    value: "8,920",
                    change: "+8.3%",
                    trend: "up",
                    icon: FileText,
                    color: "bg-green-500",
                },
                {
                    title: "Reports",
                    value: "243",
                    change: "-3.2%",
                    trend: "down",
                    icon: AlertCircle,
                    color: "bg-red-500",
                },
                {
                    title: "Total Views",
                    value: "1.2M",
                    change: "+24.1%",
                    trend: "up",
                    icon: Eye,
                    color: "bg-purple-500",
                },
            ];

            // Dữ liệu cho biểu đồ tăng trưởng người dùng
            const growthData: GrowthData[] = [
                { month: "T1", users: 4200 },
                { month: "T2", users: 5800 },
                { month: "T3", users: 7200 },
                { month: "T4", users: 9100 },
                { month: "T5", users: 12400 },
                { month: "T6", users: 15800 },
            ];

            // Dữ liệu cho biểu đồ tròn Reports
            const pieData: ReportData[] = [
                { name: "Spam", value: 45, color: "#ef4444" },
                { name: "Khiếu nại", value: 28, color: "#eab308" },
                { name: "Nội dung vi phạm", value: 35, color: "#f97316" },
                { name: "Hợp lệ", value: 92, color: "#22c55e" },
            ];

            // Dữ liệu cho biểu đồ cột hoạt động bài viết
            const activityData: PostActivityData[] = [
                { day: "T2", posts: 48, comments: 132, likes: 945 },
                { day: "T3", posts: 55, comments: 98, likes: 820 },
                { day: "T4", posts: 42, comments: 156, likes: 1100 },
                { day: "T5", posts: 67, comments: 87, likes: 980 },
                { day: "T6", posts: 59, comments: 145, likes: 1250 },
                { day: "T7", posts: 51, comments: 119, likes: 890 },
            ];

            setStats(statsData);
            setUserGrowthData(growthData);
            setReportData(pieData);
            setPostActivityData(activityData);
            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    // Hiển thị loading
    if (loading) {
        return (
            <div className="min-h-screen bg-[#18191a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1877f2] border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
            <Sidebar />

            <div className="flex-1 ml-64">   {/* ml-64 = chiều rộng của Sidebar (w-64) */}
                <Header/>   

                <div className="p-16 p-6">
                    <div className="space-y-6">
                        {/* Thống kê tổng quan */}
                        <StatsCards stats={stats} />

                        {/* Biểu đồ tăng trưởng và phân loại báo cáo */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <UserGrowthChart data={userGrowthData} />
                            <ReportPieChart data={reportData} />
                        </div>

                        {/* Hoạt động bài viết */}
                        <PostActivityChart data={postActivityData} />

                        {/* Người dùng gần đây & Bài viết phổ biến */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RecentUsers />

                            <PopularPosts />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;