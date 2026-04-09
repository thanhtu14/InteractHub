import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FaCamera,
  FaSave,
  FaTimes,
  FaShieldAlt,
  FaUserEdit,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

// Services & Schemas
import { userService } from "../services/userService";
import { profileUpdateSchema, type ProfileUpdateData, type User } from "../schemas/user.schema";

// ── Constants ────────────────────────────────────────────────
const DEFAULT_AVATAR = "/images/default-avatar.png";
const DEFAULT_COVER = "/images/anh-bia.png";
const SERVER_BASE_URL = "https://localhost:7069";

const resolveUrl = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SERVER_BASE_URL}${path}`;
};

// ── Toast Component (Giữ nguyên giao diện đẹp của bạn) ───────
type ToastType = "success" | "error";
interface ToastProps { message: string; type: ToastType; }

const Toast: React.FC<ToastProps> = ({ message, type }) => (
  <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-semibold animate-in slide-in-from-bottom-4 duration-300 ${type === "success" ? "bg-[#1a3a2a] border-green-600 text-green-300" : "bg-[#3a1a1a] border-red-600 text-red-300"}`}>
    {type === "success" ? <FaCheckCircle className="text-green-400 shrink-0" size={16} /> : <FaExclamationCircle className="text-red-400 shrink-0" size={16} />}
    {message}
  </div>
);

// ── InputField Component ─────────────────────────────────────
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, type = "text", className = "", ...rest }, ref) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-400 ml-1">{label}</label>
      <input
        ref={ref}
        type={type}
        className={`w-full px-4 py-3 bg-[#3a3b3c] border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all text-base ${error ? "border-red-500 focus:ring-red-500/20" : "border-[#4e4f50] focus:ring-[#1877f2]/50"} ${className}`}
        {...rest as any}
      />
      {hint && !error && <p className="text-gray-500 text-[11px] pl-1 uppercase tracking-wider">{hint}</p>}
      {error && <p className="text-red-400 text-xs pl-1 flex items-center gap-1 mt-1 font-medium"><span>⚠</span> {error}</p>}
    </div>
  )
);
InputField.displayName = "InputField";

// ── Main Form Component ──────────────────────────────────────
interface ProfileUpdateFormProps {
  initialData: User; // Sử dụng type User chuẩn từ Schema
  onSubmitSuccess?: (updatedUser: User) => void;
  onCancel?: () => void;
}

const ProfileUpdateForm: React.FC<ProfileUpdateFormProps> = ({
  initialData,
  onSubmitSuccess,
  onCancel,
}) => {
  const [avatarPreview, setAvatarPreview] = useState(resolveUrl(initialData?.AvatarUrl) || DEFAULT_AVATAR);
  const [coverPreview, setCoverPreview] = useState(resolveUrl(initialData?.CoverUrl) || DEFAULT_COVER);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form setup với ProfileUpdateData
  const { register, handleSubmit, watch, setError, formState: { errors } } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: initialData?.Username || "",
      email: initialData?.Email || "",
      phone: initialData?.Phone || "",
      dob: initialData?.DateOfBirth ? initialData.DateOfBirth.split("T")[0] : "",
      gender: (initialData?.Gender as any) || "Chưa cập nhật",
      bio: initialData?.Bio || "",
    },
  });

  const bioValue = watch("bio") ?? "";
  const newPasswordValue = watch("newPassword") ?? "";

  // Password Strength Logic (Giữ nguyên logic của bạn)
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: "", checks: [] };
    const checks = [
      { label: "Ít nhất 8 ký tự", passed: password.length >= 8 },
      { label: "Có chữ hoa (A-Z)", passed: /[A-Z]/.test(password) },
      { label: "Có chữ thường (a-z)", passed: /[a-z]/.test(password) },
      { label: "Có số (0-9)", passed: /\d/.test(password) },
      { label: "Có ký tự đặc biệt", passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
    const passedCount = checks.filter(c => c.passed).length;
    let score = passedCount;
    let label = score <= 2 ? "Yếu" : score <= 4 ? "Mạnh" : "Rất mạnh";
    return { score, label, checks };
  };
  const strength = getPasswordStrength(newPasswordValue);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showToast("Ảnh phải nhỏ hơn 5MB", "error");

    const url = URL.createObjectURL(file);
    if (type === "avatar") { setAvatarPreview(url); setAvatarFile(file); }
    else { setCoverPreview(url); setCoverFile(file); }
  };

  // Submit Logic sử dụng userService
  const onSubmit = async (data: ProfileUpdateData) => {
    setIsLoading(true);
    try {
      // 1. Upload ảnh nếu có thay đổi
      let currentAvatarUrl = initialData.AvatarUrl;
      let currentCoverUrl = initialData.CoverUrl;

      if (avatarFile) {
        const uploadRes = await userService.uploadAvatar(avatarFile);
        currentAvatarUrl = uploadRes.data.url || uploadRes.data.Url;
      }
      if (coverFile) {
        const uploadRes = await userService.uploadCover(coverFile);
        currentCoverUrl = uploadRes.data.url || uploadRes.data.Url;
      }

      // 2. Cập nhật Profile
      const payload = {
        ...data,
        avatarUrl: currentAvatarUrl,
        coverUrl: currentCoverUrl
      };

      const res = await userService.updateProfile(payload as any);
      
      showToast("Cập nhật thành công! 🎉", "success");
      onSubmitSuccess?.(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Có lỗi xảy ra";
      showToast(msg, "error");
      if (msg.toLowerCase().includes("mật khẩu")) setError("currentPassword", { message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="bg-[#242526] overflow-hidden max-w-4xl mx-auto text-gray-200 rounded-xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Visuals: Cover & Avatar */}
          <div className="relative pb-16">
            <div className="h-48 md:h-60 relative group overflow-hidden bg-[#3a3b3c]">
              <img src={coverPreview} className="w-full h-full object-cover" alt="Cover" />
              <button type="button" onClick={() => coverInputRef.current?.click()} className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 backdrop-blur-md transition-all">
                <FaCamera /> Thay đổi ảnh bìa
              </button>
              <input type="file" hidden ref={coverInputRef} onChange={(e) => handleFileChange(e, "cover")} accept="image/*" />
            </div>

            <div className="absolute -bottom-0 left-8">
              <div className="relative inline-block">
                <img src={avatarPreview} className="w-32 h-32 rounded-full border-4 border-[#242526] object-cover bg-[#3a3b3c]" alt="Avatar" />
                <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute bottom-1 right-1 bg-[#1877f2] p-2.5 rounded-full shadow-lg border-2 border-[#242526]">
                  <FaCamera size={14} />
                </button>
                <input type="file" hidden ref={avatarInputRef} onChange={(e) => handleFileChange(e, "avatar")} accept="image/*" />
              </div>
            </div>
          </div>

          <div className="p-8 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Cột trái: Thông tin */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-[#1877f2] font-bold uppercase tracking-widest text-xs border-b border-[#3e4042] pb-3">
                  <FaUserEdit /> Thông tin cá nhân
                </div>
                <div className="space-y-4">
                  <InputField label="Họ và tên" {...register("fullName")} error={errors.fullName?.message} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Email" {...register("email")} readOnly className="opacity-50 cursor-not-allowed bg-[#242526]" />
                    <InputField label="Số điện thoại" {...register("phone")} error={errors.phone?.message} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-400 ml-1">Giới tính</label>
                      <select {...register("gender")} className="w-full px-4 py-3 bg-[#3a3b3c] border border-[#4e4f50] rounded-xl text-gray-200">
                        <option value="Chưa cập nhật">Chưa cập nhật</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <InputField label="Ngày sinh" type="date" {...register("dob")} error={errors.dob?.message} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between"><label className="text-sm font-semibold text-gray-400">Tiểu sử</label><span className="text-[10px] text-gray-500">{bioValue.length}/160</span></div>
                    <textarea rows={3} {...register("bio")} className="w-full px-4 py-3 bg-[#3a3b3c] border border-[#4e4f50] rounded-xl focus:ring-2 focus:ring-[#1877f2]/50 outline-none resize-none text-gray-200" />
                  </div>
                </div>
              </div>

              {/* Cột phải: Bảo mật */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-[#1877f2] font-bold uppercase tracking-widest text-xs border-b border-[#3e4042] pb-3">
                  <FaShieldAlt /> Bảo mật mật khẩu
                </div>
                <div className="space-y-5">
                  <InputField label="Mật khẩu hiện tại" type="password" {...register("currentPassword")} error={errors.currentPassword?.message} />
                  <InputField label="Mật khẩu mới" type="password" {...register("newPassword")} error={errors.newPassword?.message} hint="Để trống nếu không đổi" />
                  
                  {newPasswordValue && (
                    <div className="space-y-2 px-1">
                      <div className="h-1.5 bg-[#4e4f50] rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${strength.score <= 2 ? 'bg-red-500' : strength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-400">Độ mạnh:</span>
                        <span className={strength.score <= 2 ? 'text-red-400' : 'text-green-400'}>{strength.label}</span>
                      </div>
                    </div>
                  )}

                  <InputField label="Xác nhận mật khẩu mới" type="password" {...register("confirmNewPassword")} error={errors.confirmNewPassword?.message} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-[#3e4042]">
              <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl text-gray-300 hover:bg-[#3a3b3c] font-semibold flex items-center gap-2"><FaTimes /> Hủy</button>
              <button type="submit" disabled={isLoading} className="px-10 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold rounded-xl shadow-lg disabled:opacity-60 flex items-center gap-2 min-w-[160px] justify-center">
                {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" /> : <><FaSave /> Lưu thay đổi</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProfileUpdateForm;