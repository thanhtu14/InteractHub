import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuth from "../context/useAuth";

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // Dùng Ref để đảm bảo logic login chỉ chạy DUY NHẤT 1 lần (tránh StrictMode bug)
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;

    const token = searchParams.get("token");
    const userJson = searchParams.get("user");
    const err = searchParams.get("error");

    const handleError = (msg: string) => {
      setError(msg);
      setTimeout(() => navigate("/login"), 2500);
    };

    // 1. Xử lý lỗi từ Backend trả về
    if (err) {
      const errorMap: Record<string, string> = {
        google_failed: "Đăng nhập Google thất bại.",
        github_failed: "Đăng nhập GitHub thất bại.",
        no_email: "Không thể lấy email từ tài khoản mạng xã hội.",
      };
      return handleError(errorMap[err] || "Đăng nhập thất bại.");
    }

    // 2. Kiểm tra dữ liệu đầu vào
    if (!token || !userJson) {
      return handleError("Không nhận được thông tin xác thực từ hệ thống.");
    }

    // 3. Thực hiện Login
    try {
      processed.current = true;
      // Dùng URLSearchParams tự động handle việc decode nên thường không cần decodeURIComponent thủ công
      // Nhưng nếu chuỗi bị mã hóa quá sâu, dùng try-catch là an toàn nhất
      const userData = JSON.parse(userJson);
      
      login(userData, token);
      
      // Chuyển hướng về trang chủ
      navigate("/homepage", { replace: true });
    } catch (e) {
      console.error("OAuth Parse Error:", e);
      handleError("Lỗi cấu trúc dữ liệu người dùng.");
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        {error ? (
          <div className="space-y-4">
            <div className="text-red-500 bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Có lỗi xảy ra</h2>
            <p className="text-gray-500">{error}</p>
            <div className="pt-4">
               <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-red-400 animate-progress-shrink" />
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Đang xác thực</h2>
              <p className="text-gray-500 mt-2">Vui lòng chờ trong giây lát...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;