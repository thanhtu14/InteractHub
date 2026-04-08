import React from "react";
import { Bell, Search, Settings } from "lucide-react";
import { useLocation } from "react-router-dom";

const Header: React.FC = () => {
    const location = useLocation();

    const getTitle = () => {
        // localtion.pathname sẽ trả về đường dẫn hiện tại, ví dụ: "/admin/dashboard"
        switch (location.pathname) {
            case "/admin":
                return "Trang quản trị";
            case "/admin/users":
                return "Quản lý người dùng";
            case "/admin/posts":
                return "Quản lý bài viết";
            case "/admin/reports":
                return "Quản lý báo cáo";
            case "/admin/profile":
                return "Thông tin cá nhân";
            default:
                return "Trang quản trị";
        }
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10 shadow-sm">
            <div className="h-full px-6 flex items-center justify-between">

                {/* Title */}
                <h3 onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} // click vào title sẽ scroll lên đầu trang
                    className="text-3xl font-bold text-gray-900 cursor-default hover:text-blue-600 transition-colors">
                    {getTitle()}
                </h3>

                {/* Thanh tìm kiếm */}
                <div className="flex-1 max-w-xl ml-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl 
                                text-gray-900 placeholder-gray-500 focus:outline-none 
                                focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Các nút bên phải */}
                <div className="flex items-center gap-2">
                    <button className="relative p-3 hover:bg-gray-100 rounded-xl">
                        <Bell className="w-5 h-5 text-gray-600" />
                    </button>

                    <button className="p-3 hover:bg-gray-100 rounded-xl">
                        <Settings className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        A
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;