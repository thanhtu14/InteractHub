import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import LoginForm from "../components/FormLogin";
import FormRegister from "../components/FormRegister";

import type { LoginFormData } from "../components/FormLogin";
import type { RegisterFormData } from "../components/FormRegister";

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (formData: LoginFormData) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/auth/login", formData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/homepage");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Đăng nhập thất bại!");
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Đăng nhập thất bại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData: RegisterFormData) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:8080/auth/register", formData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      alert("Đăng ký thành công! Hãy đăng nhập.");
      setIsRegistering(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || "Đăng ký thất bại!");
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Đăng ký thất bại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden relative"
         style={{
           backgroundImage: `url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2029&auto=format&fit=crop')`, // Bạn có thể thay link ảnh khác
         }}
    >
      {/* Overlay gradient tối để chữ và form nổi bật */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />

      <div className={`relative z-10 w-full max-w-6xl px-4 transition-all duration-700 ease-in-out ${isRegistering ? 'opacity-100 scale-100' : 'opacity-100 scale-100'}`}>

        {isRegistering ? (
          <div className="max-w-md mx-auto transition-all duration-500">
            <FormRegister 
              onSubmit={handleRegister} 
              onBackToLogin={() => setIsRegistering(false)} 
            />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24">
            
            {/* Phần tiêu đề bên trái */}
            <div className="flex-1 max-w-[520px] text-white text-center lg:text-left">
              <h1 className="text-7xl font-bold tracking-tight mb-4 text-white drop-shadow-lg">
                interacthub
              </h1>
              <p className="text-2xl leading-relaxed text-white/90">
                Interacthub helps you connect and share with the people in your life.
              </p>
            </div>

            {/* Form Login */}
            <div className="w-full max-w-md transition-all duration-500">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                <LoginForm 
                  onSubmit={handleLogin} 
                  onRegister={() => setIsRegistering(true)} 
                />
              </div>

              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-3xl z-20">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-logocolor border-t-transparent"></div>
                    <p className="mt-3 text-sm text-gray-600 font-medium">Đang xử lý...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;