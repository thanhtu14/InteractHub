import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaUserCircle, FaCamera } from "react-icons/fa";

// ── Zod Schema ──────────────────────────────────────────────
const profileSchema = z
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
    bio: z
      .string()
      .max(160, "Bio không quá 160 ký tự")
      .optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length >= 8,
        "Mật khẩu mới phải ít nhất 8 ký tự"
      )
      .refine(
        (val) => !val || /[A-Z]/.test(val),
        "Phải có ít nhất 1 chữ hoa"
      )
      .refine(
        (val) => !val || /[0-9]/.test(val),
        "Phải có ít nhất 1 chữ số"
      ),
    confirmNewPassword: z.string().optional(),
    avatar: z
      .instanceof(FileList)
      .optional()
      .refine(
        (files) => !files || files.length === 0 || files[0].size <= 3 * 1024 * 1024,
        "Ảnh đại diện không quá 3MB"
      )
      .refine(
        (files) =>
          !files ||
          files.length === 0 ||
          ["image/jpeg", "image/png", "image/webp"].includes(files[0].type),
        "Chỉ chấp nhận JPG, PNG, WEBP"
      ),
  })
  .refine(
    (data) => !data.newPassword || data.currentPassword,
    {
      message: "Vui lòng nhập mật khẩu hiện tại",
      path: ["currentPassword"],
    }
  )
  .refine(
    (data) => !data.newPassword || data.newPassword === data.confirmNewPassword,
    {
      message: "Mật khẩu xác nhận không khớp",
      path: ["confirmNewPassword"],
    }
  );

export type ProfileFormData = z.infer<typeof profileSchema>;

// ── Props ───────────────────────────────────────────────────
interface ProfileUpdateFormProps {
  onSubmit: (data: ProfileFormData) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

// ── Reusable Input ──────────────────────────────────────────
interface InputFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  error?: string;
  hint?: string;
  [key: string]: unknown;
}

const InputField = ({ label, placeholder, type = "text", error, hint, ...rest }: InputFieldProps) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-[#3a3b3c] border rounded-xl text-gray-200
        placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent
        transition-all text-base
        ${error ? "border-red-500 focus:ring-red-500" : "border-[#4e4f50] focus:ring-[#1877f2]"}`}
      {...rest}
    />
    {hint && !error && <p className="text-gray-500 text-xs pl-1">{hint}</p>}
    {error && (
      <p className="text-red-400 text-sm pl-1 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);

// ── Main Component ──────────────────────────────────────────
const ProfileUpdateForm: React.FC<ProfileUpdateFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  successMessage,
  errorMessage,
}) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onTouched",
    defaultValues: {
      // 🔧 MOCK — thay bằng data từ API/context khi có BE
      fullName: "Bùi Gia Quang Vinh",
      email: "vinh@example.com",
      bio: "",
    },
  });

  const bioValue = watch("bio", "");

  // Load avatar hiện tại từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      if (u.avatarUrl) {
        setAvatarPreview(
          u.avatarUrl.startsWith("http")
            ? u.avatarUrl
            : `http://localhost:8080/uploads/${u.avatarUrl}`
        );
      }
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-[#242526] border border-[#3e4042] rounded-3xl p-6 max-w-lg mx-auto shadow-xl">
      <h2 className="text-xl font-bold text-white mb-6">Chỉnh sửa thông tin</h2>

      {/* Success */}
      {successMessage && (
        <div className="mb-4 bg-green-900/40 border border-green-600 text-green-400 rounded-2xl px-4 py-3 text-sm">
          ✅ {successMessage}
        </div>
      )}

      {/* Error từ API */}
      {errorMessage && (
        <div className="mb-4 bg-red-900/40 border border-red-600 text-red-400 rounded-2xl px-4 py-3 text-sm">
          ⚠ {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[#3e4042]"
              />
            ) : (
              <FaUserCircle size={96} className="text-gray-500" />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-[#1877f2] hover:bg-[#166fe5]
                         text-white rounded-full p-2 shadow-lg transition-colors"
            >
              <FaCamera size={14} />
            </button>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            ref={fileInputRef}
            {...register("avatar", { onChange: handleAvatarChange })}
          />
          {errors.avatar && (
            <p className="text-red-400 text-sm">⚠ {errors.avatar.message as string}</p>
          )}
          <p className="text-gray-500 text-xs">JPG, PNG, WEBP · Tối đa 3MB</p>
        </div>

        {/* Thông tin cơ bản */}
        <div className="space-y-4">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
            Thông tin cơ bản
          </p>

          <InputField
            label="Họ và tên"
            placeholder="Nhập họ và tên"
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <InputField
            label="Email"
            type="email"
            placeholder="Nhập email"
            error={errors.email?.message}
            {...register("email")}
          />

          {/* Bio */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">Bio</label>
            <textarea
              placeholder="Giới thiệu bản thân..."
              rows={3}
              className={`w-full px-4 py-3 bg-[#3a3b3c] border rounded-xl text-gray-200
                placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent
                transition-all text-base resize-none
                ${errors.bio ? "border-red-500 focus:ring-red-500" : "border-[#4e4f50] focus:ring-[#1877f2]"}`}
              {...register("bio")}
            />
            <div className="flex justify-between items-center px-1">
              {errors.bio ? (
                <p className="text-red-400 text-sm">⚠ {errors.bio.message}</p>
              ) : <span />}
              <span className={`text-xs ${(bioValue?.length ?? 0) > 140 ? "text-red-400" : "text-gray-500"}`}>
                {bioValue?.length ?? 0}/160
              </span>
            </div>
          </div>
        </div>

        {/* Đổi mật khẩu */}
        <div className="space-y-4 pt-2 border-t border-[#3e4042]">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider pt-2">
            Đổi mật khẩu (không bắt buộc)
          </p>

          <InputField
            label="Mật khẩu hiện tại"
            type="password"
            placeholder="Nhập mật khẩu hiện tại"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />

          <InputField
            label="Mật khẩu mới"
            type="password"
            placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 số"
            error={errors.newPassword?.message}
            hint="Để trống nếu không muốn đổi mật khẩu"
            {...register("newPassword")}
          />

          <InputField
            label="Xác nhận mật khẩu mới"
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            error={errors.confirmNewPassword?.message}
            {...register("confirmNewPassword")}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-[#3e4042] text-gray-300
                         hover:bg-[#3a3b3c] rounded-2xl font-medium transition-all"
            >
              Hủy
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 bg-[#1877f2] hover:bg-[#166fe5] text-white font-semibold
                       rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Đang lưu...
              </span>
            ) : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileUpdateForm;