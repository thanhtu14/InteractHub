import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

// ── Zod Schema ──────────────────────────────────────────────
const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Vui lòng nhập họ tên")
      .min(3, "Họ tên phải ít nhất 3 ký tự")
      .max(50, "Họ tên không quá 50 ký tự"),
    email: z
      .string()
      .min(1, "Vui lòng nhập email")
      .email("Email không hợp lệ"),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(8, "Mật khẩu phải ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Phải có ít nhất 1 chữ hoa")
      .regex(/[0-9]/, "Phải có ít nhất 1 chữ số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ── Props ───────────────────────────────────────────────────
interface FormRegisterProps {
  onSubmit: (formData: Omit<RegisterFormData, "confirmPassword">) => void | Promise<void>;
  onBackToLogin: () => void;
  isLoading?: boolean;
  errorMessage?: string;
}

// ── Reusable Input ──────────────────────────────────────────
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

// ── Main Component ──────────────────────────────────────────
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

  // Watch password để tính strength realtime
  const passwordValue = watch("password", "");
  const strength = getPasswordStrength(passwordValue);

  const handleFormSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...rest } = data;
    onSubmit(rest);
  };

  const handleGoogleSignUp = () => {
    window.location.href = "http://localhost:8080/auth/google";
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Create account</h1>
        <p className="text-gray-500 mt-1">It's quick and easy.</p>
      </div>

      {/* Lỗi từ API */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-300 text-red-600 rounded-2xl px-4 py-3 text-sm mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>

        {/* Full Name */}
        <InputField
          placeholder="Full Name"
          error={errors.fullName?.message}
          {...register("fullName")}
        />

        {/* Email */}
        <InputField
          placeholder="Email address"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password + Strength */}
        <div className="space-y-2">
          <InputField
            placeholder="New Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          {/* Password Strength Bar */}
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

        {/* Confirm Password */}
        <InputField
          placeholder="Confirm Password"
          type="password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-green-600 hover:bg-green-700 active:bg-green-800
                     text-white font-semibold text-lg rounded-2xl transition-all duration-200
                     hover:scale-[1.02] shadow-lg hover:shadow-xl active:scale-[0.98]
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Đang tạo tài khoản...
            </span>
          ) : "Sign Up"}
        </button>

        {/* Divider */}
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">or</span>
          </div>
        </div>

        {/* Social */}
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
          Sign up with Google
        </button>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-4 px-5 bg-white/80
                     border border-gray-300 hover:border-gray-400 rounded-2xl font-medium
                     text-gray-700 transition-all hover:shadow-md active:scale-[0.98]"
        >
          <svg className="w-6 h-6" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
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