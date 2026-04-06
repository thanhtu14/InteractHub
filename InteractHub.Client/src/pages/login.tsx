import { useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginForm from "../components/FormLogin";
import FormRegister from "../components/FormRegister";
import useAuth from "../context/useAuth";

import type { LoginFormData } from "../components/FormLogin";
import type { RegisterFormData } from "../components/FormRegister";

// 🔧 MOCK — uncomment khi có BE:
// import { loginAPI, registerAPI } from "../services/authService";

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // ── Xử lý đăng nhập ────────────────────────────────────────
  const handleLogin = async (formData: LoginFormData) => {
    setLoading(true);
    setErrorMessage("");
    try {
      // ── Khi có BE: uncomment, xóa mock ──
      // const res = await loginAPI(formData.email, formData.password);
      // login(res.data.user, res.data.token);
      // navigate("/homepage");

      // 🔧 MOCK
      await new Promise((r) => setTimeout(r, 800));
      const mockUser = {
        id: "1",
        username: "quangvinh",
        email: formData.email,
        avatarUrl: "https://i.pravatar.cc/150?u=vinh",
        roles: ["User"],
      };
      login(mockUser, "mock.jwt.token_" + Date.now());
      navigate("/homepage");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Xử lý đăng ký ──────────────────────────────────────────
  const handleRegister = async (formData: Omit<RegisterFormData, "confirmPassword">) => {
    setLoading(true);
    setErrorMessage("");
    try {
      // ── Khi có BE: uncomment, xóa mock ──
      // await registerAPI(formData);
      // setIsRegistering(false);

      // 🔧 MOCK
      await new Promise((r) => setTimeout(r, 800));
      const mockUser = {
        id: "2",
        username: formData.fullName,
        email: formData.email,
        avatarUrl: undefined,
        roles: ["User"],
      };
      login(mockUser, "mock.jwt.token_" + Date.now());
      navigate("/homepage");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Đăng ký thất bại. Email có thể đã tồn tại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center
                 bg-cover bg-center bg-no-repeat overflow-hidden relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2029&auto=format&fit=crop')`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />

      {/* Layout 2 cột — giống nhau cho cả login lẫn register */}
      <div className="relative z-10 w-full max-w-6xl px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24">

          {/* CỘT TRÁI — tiêu đề (luôn hiện) */}
          <div className="flex-1 max-w-[520px] text-white text-center lg:text-left">
            <h1 className="text-7xl font-bold tracking-tight mb-4 text-white drop-shadow-lg">
              interacthub
            </h1>
            <p className="text-2xl leading-relaxed text-white/90">
              {isRegistering
                ? "Join millions of people sharing moments that matter."
                : "Interacthub helps you connect and share with the people in your life."}
            </p>
          </div>

          {/* CỘT PHẢI — form (login hoặc register) */}
          <div className="w-full max-w-md relative">
            <div className="bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
              {isRegistering ? (
                <FormRegister
                  onSubmit={handleRegister}
                  onBackToLogin={() => { setIsRegistering(false); setErrorMessage(""); }}
                  isLoading={loading}
                  errorMessage={errorMessage}
                />
              ) : (
                <LoginForm
                  onSubmit={handleLogin}
                  onRegister={() => { setIsRegistering(true); setErrorMessage(""); }}
                  isLoading={loading}
                  errorMessage={errorMessage}
                />
              )}
            </div>

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm
                              flex items-center justify-center rounded-3xl z-20">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10
                                  border-4 border-blue-600 border-t-transparent" />
                  <p className="mt-3 text-sm text-gray-600 font-medium">Đang xử lý...</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;