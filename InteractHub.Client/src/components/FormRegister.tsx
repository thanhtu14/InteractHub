import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
}

interface FormRegisterProps {
  onSubmit: (formData: RegisterFormData) => void;
  onBackToLogin: () => void;
}

const FormRegister: React.FC<FormRegisterProps> = ({ onSubmit, onBackToLogin }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleGoogleSignUp = () => {
    // TODO: Kết nối với Google OAuth sau
    window.location.href = "http://localhost:8080/auth/google"; 
    // alert("Chuyển hướng đến Google Sign Up...");
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-logocolor mb-2 tracking-tighter">
          interacthub
        </div>
        <h1 className="text-3xl font-semibold text-gray-900">Create account</h1>
        <p className="text-gray-500 mt-1">It's quick and easy.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg placeholder:text-gray-400"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg placeholder:text-gray-400"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="New Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-5 py-4 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg placeholder:text-gray-400"
          required
        />

        <button
          type="submit"
          className="w-full py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 
                     text-white font-semibold text-lg rounded-2xl transition-all duration-200 
                     hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          Sign Up
        </button>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">or</span>
          </div>
        </div>

        {/* Google Sign Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          className="w-full flex items-center justify-center gap-3 py-4 px-5 
                     bg-white border border-gray-300 hover:border-gray-400 
                     hover:bg-gray-50 rounded-2xl font-medium text-gray-700 
                     transition-all duration-200 hover:shadow-md active:scale-[0.98]"
        >
          <img 
            src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
            alt="Google" 
            className="w-6 h-6"
          />
          <span>Sign up with Google</span>
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-4 px-5 bg-white border border-gray-300 hover:border-gray-400 rounded-2xl font-medium text-gray-700 transition-all hover:shadow-md active:scale-[0.98]"
        >
          <svg className="w-6 h-6" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          Continue with Github
        </button>

        {/* Back to Login */}
        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full text-center text-logocolor hover:text-blue-600 
                     font-medium py-3 transition-colors text-base mt-2"
        >
          
          Already have an account? <span className="underline">Log in</span>
        </button>
      </form>
    </div>
  );
};

export default FormRegister;