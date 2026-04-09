import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const LoginRoute = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("interact_hub_token");

      if (!token) {
        setIsAuthenticated(false);
        setIsChecking(false);
        return;
      }

      try {
        // Gọi API kiểm tra token có hợp lệ không
        const res = await fetch("https://localhost:7069/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          // Token không hợp lệ (có thể hết hạn)
          localStorage.removeItem("interact_hub_token");
          localStorage.removeItem("interact_hub_user");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Lỗi kiểm tra token:", error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#18191a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#1877f2] border-t-transparent"></div>
      </div>
    );
  }

  // Nếu đã đăng nhập → chuyển hướng về homepage
  if (isAuthenticated) {
    return <Navigate to="/homepage" replace />;
  }

  // Chưa đăng nhập → cho vào trang Login
  return <>{children}</>;
};

export default LoginRoute;