import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Import schema từ file chung
import {
  emailStepSchema,
  otpStepSchema,
  resetPasswordSchema,
  type ResetPasswordData,
} from "../schemas/auth.schema";

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

// ── Định nghĩa type cho InputField (sửa lỗi any ở đây) ─────────────────────────────
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  error?: string;
}

const InputField = ({ placeholder, type = "text", error, ...rest }: InputFieldProps) => (
  <div className="space-y-1">
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full px-5 py-4 bg-white border rounded-2xl focus:outline-none focus:ring-2 transition-all text-lg
        ${error ? "border-red-400 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500"}`}
      {...rest}
    />
    {error && <p className="text-red-500 text-sm pl-2">⚠ {error}</p>}
  </div>
);

const ForgotPassword = ({ onBackToLogin }: { onBackToLogin: () => void }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ==================== MOCK BACKEND FUNCTIONS ====================

  const mockSendResetEmail = async (email: string): Promise<boolean> => {
    console.log(`[MOCK API] Đang gửi email reset password đến: ${email}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[MOCK API] Email đã được gửi thành công!`);
        resolve(true);
      }, 1500);
    });
  };

  const mockVerifyOTP = async (otp: string): Promise<boolean> => {
    console.log(`[MOCK API] Đang verify OTP: ${otp}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const isValid = otp === "123456";
        console.log(`[MOCK API] OTP ${isValid ? "Hợp lệ" : "Không hợp lệ"}`);
        resolve(isValid);
      }, 1200);
    });
  };

  const mockResetPassword = async (password: string): Promise<boolean> => {
    console.log(`[MOCK API] Đang cập nhật mật khẩu mới...`);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[MOCK API] Mật khẩu đã được thay đổi thành công!`);
        resolve(true);
      }, 1800);
    });
  };

  // ==================== HANDLERS ====================

  const handleSendEmail = async (data: z.infer<typeof emailStepSchema>) => {
    setIsLoading(true);
    const success = await mockSendResetEmail(data.email);
    if (success) {
      setEmail(data.email);
      setStep(2);
    } else {
      alert("Có lỗi khi gửi email. Vui lòng thử lại!");
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (data: z.infer<typeof otpStepSchema>) => {
    setIsLoading(true);
    const isValid = await mockVerifyOTP(data.otp);
    if (isValid) {
      setStep(3);
    } else {
      alert("Mã OTP không đúng!\n\n(Mã mock đúng: 123456)");
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (data: ResetPasswordData) => {
    setIsLoading(true);
    const success = await mockResetPassword(data.password);
    if (success) {
      alert("✅ Mật khẩu đã được thay đổi thành công!");
      onBackToLogin();
    } else {
      alert("Có lỗi xảy ra khi cập nhật mật khẩu!");
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl  max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {step === 1 ? "Reset Password" : step === 2 ? "Verify OTP" : "New Password"}
        </h2>
        <p className="text-gray-500 mt-2">
          {step === 1 && "Nhập email để nhận mã khôi phục."}
          {step === 2 && `Mã đã gửi tới ${email}`}
          {step === 3 && "Thiết lập mật khẩu mới cho tài khoản."}
        </p>
      </div>

      {step === 1 && <EmailStep onSubmit={handleSendEmail} onBack={onBackToLogin} loading={isLoading} />}
      {step === 2 && <OtpStep onSubmit={handleVerifyOtp} loading={isLoading} />}
      {step === 3 && <ResetStep onSubmit={handleResetPassword} loading={isLoading} />}
    </div>
  );
};

// ==================== SUB COMPONENTS ====================

// Type cho các sub-component props
interface StepProps {
  onSubmit: (data: any) => Promise<void>;   // Có thể refine sau nếu muốn chặt hơn
  onBack?: () => void;
  loading: boolean;
}

const EmailStep = ({ onSubmit, onBack, loading }: StepProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(emailStepSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <InputField placeholder="Email address" error={errors.email?.message} {...register("email")} />
      
      <button
        disabled={loading}
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-70"
      >
        {loading ? "Đang gửi email..." : "Continue"}
      </button>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full text-gray-500 text-sm hover:text-blue-600"
        >
          Back to Login
        </button>
      )}
    </form>
  );
};

const OtpStep = ({ onSubmit, loading }: any) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({ 
    resolver: zodResolver(otpStepSchema) 
  });

  // Theo dõi giá trị của trường "otp" (chuỗi 6 số)
  const otpValue = watch("otp", "");

  // Hàm xử lý khi gõ vào từng ô
  const handleInputChange = (index: number, value: string) => {
    const currentOtp = otpValue.split("");
    // Chỉ lấy ký tự cuối cùng nếu người dùng gõ đè
    currentOtp[index] = value.slice(-1);
    const newOtp = currentOtp.join("");
    
    setValue("otp", newOtp, { shouldValidate: true });

    // Tự động nhảy sang ô tiếp theo nếu có giá trị
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Hàm xử lý phím Backspace để quay lại ô trước
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Hidden input để react-hook-form vẫn quản lý được giá trị tổng */}
      <input type="hidden" {...register("otp")} />

      <div className="flex justify-between gap-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otpValue[index] || ""}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all outline-none
              ${errors.otp 
                ? "border-red-400 bg-red-50 text-red-600" 
                : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50"
              }`}
          />
        ))}
      </div>

      {errors.otp && (
        <p className="text-red-500 text-xs text-center font-medium">
          ⚠ {errors.otp.message as string}
        </p>
      )}

      <button
        disabled={loading}
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Đang xác thực..." : "Verify OTP"}
      </button>

      <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">
        Mã OTP thử nghiệm: <span className="text-blue-500 font-bold">123456</span>
      </p>
    </form>
  );
};

const ResetStep = ({ onSubmit, loading }: StepProps) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const passwordValue = watch("password", "");
  const strength = getPasswordStrength(passwordValue);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <InputField
          type="password"
          placeholder="Mật khẩu mới"
          error={errors.password?.message}
          {...register("password")}
        />

        {passwordValue.length > 0 && (
          <div className="space-y-1 px-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= strength.score ? strength.color : "bg-gray-200"
                  }`}
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
        type="password"
        placeholder="Xác nhận mật khẩu mới"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <button
        disabled={loading}
        className="w-full py-4 bg-green-600 text-white font-semibold rounded-2xl hover:bg-green-700 transition-all cursor-pointer disabled:opacity-70"
      >
        {loading ? "Đang cập nhật..." : "Update Password"}
      </button>
    </form>
  );
};

export default ForgotPassword;