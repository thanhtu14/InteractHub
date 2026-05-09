import { UserPlus, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import RegisterModal from "../admin/RegisterModal";

const Header: React.FC = () => {
    const location = useLocation();
    const [user, setUser] = useState<any>(null);
    // const navigate = useNavigate();
    const [openRegister, setOpenRegister] = useState(false);

    const BASE_URL = "https://localhost:7069";

    useEffect(() => {
        const loadUser = () => {
            const data = localStorage.getItem("interact_hub_user");
            if (data) setUser(JSON.parse(data));
        };

        loadUser();

        // Lắng nghe thay đổi từ tab khác
        window.addEventListener("storage", loadUser);

        // Lắng nghe thay đổi trong cùng tab
        window.addEventListener("user-updated", loadUser);

        return () => {
            window.removeEventListener("storage", loadUser);
            window.removeEventListener("user-updated", loadUser);
        };
    }, []);
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

    // LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("interact_hub_user");
        localStorage.removeItem("interact_hub_token");
        window.location.href = "/login";

    };


    return (
        <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10 shadow-sm">
            <div className="h-full px-6 flex items-center justify-between">

                {/* Title */}
                <h3 onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} // click vào title sẽ scroll lên đầu trang
                    className="text-3xl font-bold text-gray-900 cursor-default hover:text-blue-600 transition-colors">
                    {getTitle()}
                </h3>
                {/* Các nút bên phải */}
                <div className="flex items-center gap-2">
                    {/* LOGOUT */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 px-3 py-2 hover:bg-red-50 text-red-500 rounded-xl transition"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="text-sm font-medium">Đăng xuất</span>
                    </button>

                    <button
                        onClick={() => setOpenRegister(true)}
                        className="p-3 hover:bg-gray-100 rounded-xl">
                        <UserPlus className="w-5 h-5 text-gray-600" />
                    </button>

                    <img
                        src={
                            user?.AvatarUrl
                                ? (user.AvatarUrl.startsWith("http")
                                    ? user.AvatarUrl
                                    : BASE_URL + user.AvatarUrl)
                                : "/default-avatar.png"
                        }
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover"
                    />
                </div>
            </div>
            <RegisterModal
                open={openRegister}
                onClose={() => setOpenRegister(false)}
            />
        </header>
    );

};

export default Header;