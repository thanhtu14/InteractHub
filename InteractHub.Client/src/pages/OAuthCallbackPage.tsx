import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../context/useAuth";

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    // Chặn chạy 2 lần do React Strict Mode
    if (processed.current) return;

    const token = searchParams.get("token");
    const userJson = searchParams.get("user");
    const err = searchParams.get("error");

    const handleError = (msg: string) => {
      setError(msg);
      // Tự động về login sau 3s nếu lỗi
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    };

    // 1. Check lỗi từ Backend (Google/Github fail)
    if (err) {
      const errorMap: Record<string, string> = {
        google_failed: "Đăng nhập Google thất bại.",
        github_failed: "Đăng nhập GitHub thất bại.",
        no_email: "Tài khoản của bạn không cung cấp Email công khai.",
      };
      return handleError(errorMap[err] || "Hệ thống xác thực gặp sự cố.");
    }

    // 2. Kiểm tra tính đầy đủ của dữ liệu
    if (!token || !userJson) {
      return handleError("Thông tin xác thực không hợp lệ hoặc đã hết hạn.");
    }

    // 3. Thực hiện xử lý login
    try {
      processed.current = true;

      // QUAN TRỌNG: Cần decodeURIComponent vì dữ liệu JSON trên URL luôn bị encode
      const decodedUser = decodeURIComponent(userJson);
      const userData = JSON.parse(decodedUser);
      
      // Lưu vào context/localStorage
      login(userData, token);
      
      // Về trang chủ thành công
      navigate("/homepage", { replace: true });
    } catch (e) {
      console.error("OAuth Callback Error:", e);
      handleError("Lỗi đồng bộ dữ liệu người dùng.");
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-md w-full text-center p-10 bg-white rounded-3xl shadow-xl border border-gray-100">
        {error ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="text-red-500 bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Đăng nhập thất bại</h2>
            <p className="text-gray-500 mt-3 text-lg">{error}</p>
            <p className="text-gray-400 text-sm mt-6 italic">Đang quay lại trang đăng nhập...</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-50/50 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Xác thực thành công</h2>
              <p className="text-gray-500 mt-2 text-lg">Đang thiết lập phiên làm việc của bạn...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;