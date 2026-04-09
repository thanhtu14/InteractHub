import React, { useState, useRef } from "react";
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
import { profileSchema, type ProfileFormData } from "../schemas/profile.schema";

// ── Constants ────────────────────────────────────────────────
const DEFAULT_AVATAR = "/images/default-avatar.png";
const DEFAULT_COVER = "/images/anh-bia.png";
const API_BASE = "https://localhost:7069/api";
const SERVER_BASE_URL = "https://localhost:7069";

const resolveUrl = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${SERVER_BASE_URL}${path}`;
};

// ── Toast ────────────────────────────────────────────────────
type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
}

const Toast: React.FC<ToastProps> = ({ message, type }) => (
  <div
    className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-semibold
      animate-in slide-in-from-bottom-4 duration-300
      ${type === "success"
        ? "bg-[#1a3a2a] border-green-600 text-green-300"
        : "bg-[#3a1a1a] border-red-600 text-red-300"
      }`}
  >
    {type === "success" ? (
      <FaCheckCircle className="text-green-400 shrink-0" size={16} />
    ) : (
      <FaExclamationCircle className="text-red-400 shrink-0" size={16} />
    )}
    {message}
  </div>
);

// ── InputField ───────────────────────────────────────────────
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, type = "text", className = "", ...rest }, ref) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-400 ml-1">
        {label}
      </label>
      <input
        ref={ref}
        type={type}
        className={`w-full px-4 py-3 bg-[#3a3b3c] border rounded-xl text-gray-200 placeholder-gray-500
          focus:outline-none focus:ring-2 transition-all text-base
          ${error
            ? "border-red-500 focus:ring-red-500/20"
            : "border-[#4e4f50] focus:ring-[#1877f2]/50"
          } ${className}`}
        {...rest}
      />
      {hint && !error && (
        <p className="text-gray-500 text-[11px] pl-1 uppercase tracking-wider">
          {hint}
        </p>
      )}
      {error && (
        <p className="text-red-400 text-xs pl-1 flex items-center gap-1 mt-1 font-medium">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
);
InputField.displayName = "InputField";

// ── ProfileUpdateForm ────────────────────────────────────────
interface ProfileUpdateFormProps {
  initialData?: any;
  onSubmitSuccess?: (updatedUser: any) => void;
  onCancel?: () => void;
}

const ProfileUpdateForm: React.FC<ProfileUpdateFormProps> = ({
  initialData,
  onSubmitSuccess,
  onCancel,
}) => {
  // States
  const [avatarPreview, setAvatarPreview] = useState<string>(
    resolveUrl(initialData?.AvatarUrl) || DEFAULT_AVATAR
  );
  const [coverPreview, setCoverPreview] = useState<string>(
    resolveUrl(initialData?.CoverUrl) || DEFAULT_COVER
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem("interact_hub_token");

  // Form
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: initialData?.Username || "",
      email: initialData?.Email || "",
      phone: initialData?.Phone || "",
      dob: initialData?.DateOfBirth ? initialData.DateOfBirth.split("T")[0] : "",
      gender: initialData?.Gender || "",
      bio: initialData?.Bio || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const bioValue = watch("bio") ?? "";
  const newPasswordValue = watch("newPassword") ?? "";

  // Password Strength
  const getPasswordStrength = (password: string) => {
    if (!password) {
      return { score: 0, label: "", checks: [] };
    }

    const checks = [
      { label: "Ít nhất 8 ký tự", passed: password.length >= 8 },
      { label: "Có chữ hoa (A-Z)", passed: /[A-Z]/.test(password) },
      { label: "Có chữ thường (a-z)", passed: /[a-z]/.test(password) },
      { label: "Có số (0-9)", passed: /\d/.test(password) },
      { label: "Có ký tự đặc biệt (!@#$...)", passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
    ];

    const passedCount = checks.filter((c) => c.passed).length;

    let score = 0;
    let label = "Rất yếu";

    if (passedCount === 5) { score = 4; label = "Rất mạnh"; }
    else if (passedCount >= 4) { score = 3; label = "Mạnh"; }
    else if (passedCount >= 3) { score = 2; label = "Trung bình"; }
    else if (passedCount >= 2) { score = 1; label = "Yếu"; }
    else { score = 0; label = "Rất yếu"; }

    return { score, label, checks };
  };

  const strength = getPasswordStrength(newPasswordValue);

  // Toast
  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // File handlers
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Ảnh quá lớn! Vui lòng chọn ảnh dưới 5MB.", "error");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    if (type === "avatar") {
      setAvatarPreview(objectUrl);
      setAvatarFile(file);
    } else {
      setCoverPreview(objectUrl);
      setCoverFile(file);
    }
  };

  const uploadImage = async (file: File, endpoint: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.url ?? data?.Url ?? null;
  };

  // Submit
  const onSubmit = async (formData: ProfileFormData) => {
    setIsLoading(true);

    try {
      let avatarUrl: string | null = initialData?.AvatarUrl ?? null;
      if (avatarFile) {
        const uploaded = await uploadImage(avatarFile, "/users/upload-avatar");
        if (uploaded) avatarUrl = uploaded;
        else {
          showToast("Upload ảnh đại diện thất bại!", "error");
          return;
        }
      }

      let coverUrl: string | null = initialData?.CoverUrl ?? null;
      if (coverFile) {
        const uploaded = await uploadImage(coverFile, "/users/upload-cover");
        if (uploaded) coverUrl = uploaded;
        else {
          showToast("Upload ảnh bìa thất bại!", "error");
          return;
        }
      }

      const payload: Record<string, any> = {
        Username: formData.fullName,
        Phone: formData.phone || null,
        DateOfBirth: formData.dob || null,
        Bio: formData.bio || null,
        Gender: formData.gender || null,
        AvatarUrl: avatarUrl,
        CoverUrl: coverUrl,
      };

      if (formData.newPassword) {
        payload.CurrentPassword = formData.currentPassword;
        payload.NewPassword = formData.newPassword;
        payload.ConfirmNewPassword = formData.confirmNewPassword;
      }

      const res = await fetch(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        localStorage.setItem("interact_hub_user", JSON.stringify(updatedUser));
        showToast("Cập nhật hồ sơ thành công! 🎉", "success");
        onSubmitSuccess?.(updatedUser);
      } else {
        const errData = await res.json().catch(() => null);
        const msg = errData?.message ?? errData?.Message ?? "Cập nhật thất bại";
        
        if (res.status === 400 && (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("mật khẩu"))) {
          setError("currentPassword", { message: msg });
        } else {
          showToast(msg, "error");
        }
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      showToast("Không thể kết nối tới máy chủ!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="bg-[#242526] overflow-hidden max-w-4xl mx-auto shadow-2xl text-gray-200 mb-10 rounded-xl border border-[#3e4042]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* SECTION 1: VISUALS */}
          <div className="relative pb-16">
            {/* Cover Photo */}
            <div className="h-48 md:h-60 relative group overflow-hidden">
              <img
                src={coverPreview}
                alt="Ảnh bìa"
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER; }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 backdrop-blur-md transition-all"
              >
                <FaCamera /> Thay đổi ảnh bìa
              </button>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                hidden
                ref={coverInputRef}
                onChange={(e) => handleFileChange(e, "cover")}
              />
            </div>

            {/* Avatar */}
            <div className="absolute -bottom-0 left-8">
              <div className="relative inline-block">
                <img
                  src={avatarPreview}
                  alt="Ảnh đại diện"
                  className="w-32 h-32 rounded-full border-4 border-[#242526] object-cover bg-[#3a3b3c]"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR; }}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-[#1877f2] hover:bg-[#166fe5] text-white p-2.5 rounded-full shadow-lg border-2 border-[#242526] transition-transform active:scale-90"
                >
                  <FaCamera size={14} />
                </button>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  ref={avatarInputRef}
                  onChange={(e) => handleFileChange(e, "avatar")}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: FIELDS */}
          <div className="p-8 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Cột trái: Thông tin cá nhân */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-[#1877f2] font-bold uppercase tracking-widest text-xs border-b border-[#3e4042] pb-3">
                  <FaUserEdit /> Thông tin cá nhân
                </div>

                <div className="space-y-4">
                  <InputField
                    label="Họ và tên"
                    placeholder="Nhập họ và tên..."
                    {...register("fullName")}
                    error={errors.fullName?.message}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Email"
                      type="email"
                      {...register("email")}
                      readOnly
                      className="opacity-50 cursor-not-allowed bg-[#242526]"
                    />
                    <InputField
                      label="Số điện thoại"
                      placeholder="09xxxx"
                      {...register("phone")}
                      error={errors.phone?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Gender */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-400 ml-1">
                        Giới tính
                      </label>
                      <div className="relative">
                        <select
                          {...register("gender")}
                          className="w-full px-4 py-3 bg-[#3a3b3c] border border-[#4e4f50] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1877f2]/50 text-gray-200 text-base appearance-none"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                          <option value="Khác">Khác</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                          ▼
                        </div>
                      </div>
                      {errors.gender?.message && (
                        <p className="text-red-400 text-xs pl-1 flex items-center gap-1 font-medium">
                          <span>⚠</span> {errors.gender.message}
                        </p>
                      )}
                    </div>

                    <InputField
                      label="Ngày sinh"
                      type="date"
                      {...register("dob")}
                      error={errors.dob?.message}
                    />
                  </div>

                  {/* Tiểu sử */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between ml-1">
                      <label className="text-sm font-semibold text-gray-400">Tiểu sử</label>
                      <span className={`text-[10px] font-mono transition-colors ${bioValue.length > 150 ? "text-orange-400" : "text-gray-500"}`}>
                        {bioValue.length}/160
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Viết gì đó về bạn..."
                      {...register("bio")}
                      className="w-full px-4 py-3 bg-[#3a3b3c] border border-[#4e4f50] rounded-xl focus:ring-2 focus:ring-[#1877f2]/50 outline-none resize-none transition-all text-gray-200 placeholder-gray-500"
                    />
                    {errors.bio && (
                      <p className="text-red-400 text-xs pl-1 flex items-center gap-1 font-medium">
                        <span>⚠</span> {errors.bio.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cột phải: Bảo mật + Password Strength */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-[#1877f2] font-bold uppercase tracking-widest text-xs border-b border-[#3e4042] pb-3">
                  <FaShieldAlt /> Bảo mật mật khẩu
                </div>

                <div className="space-y-5">
                  <InputField
                    label="Mật khẩu hiện tại"
                    type="password"
                    placeholder="Nhập nếu muốn đổi mật khẩu"
                    {...register("currentPassword")}
                    error={errors.currentPassword?.message}
                  />

                  {/* Mật khẩu mới */}
                  <div className="space-y-1.5">
                    <InputField
                      label="Mật khẩu mới"
                      type="password"
                      placeholder="Tối thiểu 8 ký tự"
                      {...register("newPassword")}
                      error={errors.newPassword?.message}
                      hint="Để trống nếu không thay đổi"
                    />

                    {newPasswordValue && (
                      <div className="mt-3 px-1 space-y-3">
                        <div className="h-1.5 bg-[#4e4f50] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              strength.score === 0 ? "bg-red-500 w-[20%]" :
                              strength.score === 1 ? "bg-orange-500 w-[40%]" :
                              strength.score === 2 ? "bg-yellow-500 w-[60%]" :
                              strength.score === 3 ? "bg-blue-500 w-[80%]" :
                              "bg-green-500 w-full"
                            }`}
                          />
                        </div>

                        <p className="text-xs font-medium flex justify-between">
                          <span className="text-gray-400">Độ mạnh mật khẩu:</span>
                          <span className={`font-semibold ${
                            strength.score === 0 ? "text-red-400" :
                            strength.score === 1 ? "text-orange-400" :
                            strength.score === 2 ? "text-yellow-400" :
                            strength.score === 3 ? "text-blue-400" : "text-green-400"
                          }`}>
                            {strength.label}
                          </span>
                        </p>

                        <div className="space-y-1.5 text-sm">
                          {strength.checks.map((check, index) => (
                            <div key={index} className="flex items-center gap-2">
                              {check.passed ? (
                                <FaCheckCircle className="text-green-400 shrink-0" size={15} />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-500 shrink-0" />
                              )}
                              <span className={check.passed ? "text-green-300" : "text-gray-400"}>
                                {check.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <InputField
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    {...register("confirmNewPassword")}
                    error={errors.confirmNewPassword?.message}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-[#3e4042]">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl text-gray-300 hover:bg-[#3a3b3c] font-semibold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTimes /> Hủy
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="px-10 py-2.5 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 min-w-[160px] justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FaSave /> Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ProfileUpdateForm;