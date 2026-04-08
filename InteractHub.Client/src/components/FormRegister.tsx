import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Import schema từ file trước đó
import { registerSchema, type RegisterFormData } from "../schemas/auth.schema"; 
// hoặc đường dẫn phù hợp: "@/schemas/auth" tùy theo cấu trúc project của bạn

// ── Password strength helper ────────────────────────────────
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Yếu", color: "bg-red-500" };
  if (score === 2) return { score, label: "Trung bình", color: "bg-yellow-500" };
  if (score === 3) return { score, label: "Mạnh", color: "bg-blue-500" };
  return { score, label: "Rất mạnh", color: "bg-green-500" };
};

interface FormRegisterProps {
  onSubmit: (formData: Omit<RegisterFormData, "confirmPassword">) => void | Promise<void>;
  onBackToLogin: () => void;
  isLoading?: boolean;
  errorMessage?: string;
}

interface InputFieldProps {
  placeholder: string;
  type?: string;
  error?: string;
  [key: string]: unknown;
}

const InputField = ({ placeholder, type = "text", error, ...rest }: InputFieldProps) => (
  <div className="space-y-1">
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full px-5 py-4 bg-white border rounded-2xl focus:outline-none
        focus:ring-2 focus:border-transparent transition-all text-lg placeholder:text-gray-400
        ${error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`}
      {...rest}
    />
    {error && (
      <p className="text-red-500 text-sm pl-2 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);

const FormRegister: React.FC<FormRegisterProps> = ({
  onSubmit,
  onBackToLogin,
  isLoading = false,
  errorMessage,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const passwordValue = watch("password", "");
  const strength = getPasswordStrength(passwordValue);

  const handleFormSubmit = (data: RegisterFormData) => {
    const {  ...rest } = data;
    onSubmit(rest);
  };

  const handleGoogleSignUp = () => {
    window.location.href = "https://localhost:7069/api/auth/google";
  };

  const handleGitHubSignUp = () => {
    window.location.href = "https://localhost:7069/api/auth/github";
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 max-w-md p-2">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Create account</h1>
        <p className="text-gray-500 mt-1">It's quick and easy.</p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-300 text-red-600 rounded-2xl px-4 py-3 text-sm mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
        <InputField
          placeholder="Full Name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        <InputField
          placeholder="Email address"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="space-y-2">
          <InputField
            placeholder="New Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          {passwordValue.length > 0 && (
            <div className="space-y-1 px-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300
                      ${i <= strength.score ? strength.color : "bg-gray-200"}`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${
                strength.score <= 1 ? "text-red-500" :
                strength.score === 2 ? "text-yellow-600" :
                strength.score === 3 ? "text-blue-600" : "text-green-600"
              }`}>
                Độ mạnh: {strength.label}
              </p>
            </div>
          )}
        </div>

        <InputField
          placeholder="Confirm Password"
          type="password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-green-600 hover:bg-green-700 active:bg-green-800
                     text-white font-semibold text-lg rounded-2xl transition-all duration-200
                     hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-[0.98]
                     disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? "Đang tạo tài khoản..." : "Sign Up"}
        </button>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500 uppercase">Hoặc đăng ký bằng</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="cursor-pointer w-full flex items-center justify-center gap-3 py-4 px-5
                       bg-white border border-gray-300 hover:border-gray-400
                       hover:bg-gray-50 rounded-2xl font-medium text-gray-700
                       transition-all duration-200 hover:shadow-md active:scale-[0.98]"
          >
            <img
              src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png"
              alt="Google"
              className="w-6 h-6"
            />
            Google
          </button>

          <button
            type="button"
            onClick={handleGitHubSignUp}
            className="cursor-pointer w-full flex items-center justify-center gap-3 py-4 px-5 bg-white
                       border border-gray-300 hover:border-gray-400 rounded-2xl font-medium
                       text-gray-700 transition-all hover:shadow-md active:scale-[0.98]"
          >
            <svg className="w-6 h-6" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
            Github
          </button>
        </div>

        <button
          type="button"
          onClick={onBackToLogin}
          className="cursor-pointer w-full text-center text-blue-600 hover:text-blue-700
                     font-medium py-3 transition-colors text-base mt-2"
        >
          Already have an account? <span className="underline">Log in</span>
        </button>
      </form>
    </div>
  );
};

export default FormRegister;