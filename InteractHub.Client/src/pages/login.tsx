import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import LoginForm from "../components/FormLogin";
import FormRegister from "../components/FormRegister";
import ForgotPassword from "../components/ForgotPassword"; // Import component mới
import { useAuth } from "../context/useAuth";
import { loginAPI, registerAPI } from "../services/authService";

import type { LoginFormData } from "../schemas/auth.schema";
import type { RegisterFormData } from "../schemas/auth.schema";

const LoginPage = () => {
  // Thay thế boolean bằng string để quản lý 3 màn hình
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // ── Xử lý đăng nhập ────────────────────────────────────────
  const handleLogin = async (formData: LoginFormData) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await loginAPI(formData.email, formData.password);
      login(res.data.User, res.data.Token);
      // localStorage.setItem("interact_hub_token", res.data.Token);

      // // 2. Lưu user (là Object nên PHẢI dùng JSON.stringify)
      // localStorage.setItem("interact_hub_user", JSON.stringify(res.data.User));
      navigate("/homepage");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "Đăng nhập thất bại");
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
      const res = await registerAPI(formData);
      login(res.data.user, res.data.token);
      navigate("/homepage");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "Đăng ký thất bại");
      } else {
        setErrorMessage("Đăng ký thất bại. Vui lòng thử lại.");
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
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />

      <div className="relative z-10 w-full max-w-6xl px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24">

          {/* CỘT TRÁI */}
          <div className="flex-1 max-w-[520px] text-white text-center lg:text-left">
            <h1 className="text-7xl font-bold tracking-tight mb-4 text-white drop-shadow-lg">
              interacthub
            </h1>
            <p className="text-2xl leading-relaxed text-white/90">
              {authMode === "register" 
                ? "Join millions of people sharing moments that matter." 
                : "Interacthub helps you connect and share with the people in your life."}
            </p>
          </div>

          {/* CỘT PHẢI */}
          <div className="w-full max-w-md relative">
            <div className="bg-white backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 min-h-[450px] flex flex-col justify-center">
              
              {/* SWITCH GIAO DIỆN TẠI ĐÂY */}
              {authMode === "login" && (
                <LoginForm
                  onSubmit={handleLogin}
                  onRegister={() => { setAuthMode("register"); setErrorMessage(""); }}
                  onForgotPassword={() => { setAuthMode("forgot"); setErrorMessage(""); }} // Cần thêm prop này vào LoginForm
                  isLoading={loading}
                  errorMessage={errorMessage}
                />
              )}

              {authMode === "register" && (
                <FormRegister
                  onSubmit={handleRegister}
                  onBackToLogin={() => { setAuthMode("login"); setErrorMessage(""); }}
                  isLoading={loading}
                  errorMessage={errorMessage}
                />
              )}

              {authMode === "forgot" && (
                <ForgotPassword 
                  onBackToLogin={() => { setAuthMode("login"); setErrorMessage(""); }} 
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