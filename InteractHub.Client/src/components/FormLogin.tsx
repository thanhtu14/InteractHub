import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";

export interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (formData: LoginFormData) => void;
  onRegister: () => void;
}

const LoginForm = ({ onSubmit, onRegister }: LoginFormProps) => {
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Hàm đăng nhập Google (sẽ kết nối sau với backend)
  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    window.location.href = "http://localhost:8080/auth/google"; // hoặc dùng Firebase / NextAuth
    // alert("Đang chuyển hướng đến Google...");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-3xl font-semibold text-gray-900">Welcome back</h2>
        <p className="text-gray-500 mt-1">Sign in to continue to Interacthub</p>
      </div>

      
      {/* Form Email + Password */}
      <input
        type="email"
        name="email"
        placeholder="Email address or phone number"
        value={formData.email}
        onChange={handleChange}
        className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
        required
      />

      <button
        type="submit"
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-lg rounded-2xl transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
      >
        Log in
      </button>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-4 text-gray-500">or</span>
        </div>
      </div>

      {/* Social Login Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-4 px-5 bg-white border border-gray-300 hover:border-gray-400 rounded-2xl font-medium text-gray-700 transition-all hover:shadow-md active:scale-[0.98]"
        >
          <img 
            src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
            alt="Google" 
            className="w-6 h-6"
          />
          Continue with Google
        </button>

        {/* Có thể thêm Facebook, Apple, GitHub sau */}
        
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-4 px-5 bg-white border border-gray-300 hover:border-gray-400 rounded-2xl font-medium text-gray-700 transition-all hover:shadow-md active:scale-[0.98]"
        >
          <svg className="w-6 h-6" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          Continue with Github
        </button>
       
      </div>

      

      <a href="#" className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
        Forgotten password?
      </a>

      <button
        type="button"
        onClick={onRegister}
        className="w-full py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold text-lg rounded-2xl transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
      >
        Create new account
      </button>
    </form>
  );
};

export default LoginForm;