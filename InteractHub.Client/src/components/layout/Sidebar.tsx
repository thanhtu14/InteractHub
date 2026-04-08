import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    FileText,
    AlertCircle,
    UserCircle
} from "lucide-react";

// ==================== Interface ====================

interface MenuItem {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const Sidebar: React.FC = () => {
    const location = useLocation();

    const menuItems: MenuItem[] = [
        {
            path: "/admin",
            label: "Dashboard",
            icon: LayoutDashboard
        },
        {
            path: "/admin/users",
            label: "Quản lý người dùng",
            icon: Users
        },
        {
            path: "/admin/posts",
            label: "Quản lý bài viết",
            icon: FileText
        },
        {
            path: "/admin/reports",
            label: "Quản lý báo cáo",
            icon: AlertCircle
        },
        {
            path: "/admin/profile",
            label: "Thông tin cá nhân",
            icon: UserCircle
        },
    ];

    return (
        <div className="w-64 bg-gray-50 border-r border-gray-700 h-screen fixed left-0 top-0 flex flex-col text-gray-900">
            {/* Header */}
            <div className="p-6 border-b border-gray-300">
                <h1 className="text-2xl font-bold ">Admin Panel</h1>
                <p className="text-sm text-gray-500 mt-1">Mạng xã hội</p>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? "bg-blue-100 text-blue-700"
                                            : "text-gray-800 hover:bg-blue-100 hover:text-blue-700"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer - Thông tin admin */}
            <div className="p-4 border-t border-gray-300 mt-auto">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-200 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                        A
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                        <p className="text-xs text-gray-500 truncate">admin@example.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;