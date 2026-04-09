import { z } from "zod";
import { passwordValidation } from "./auth.schema";

// 📌 Profile Update Schema
export const profileSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Vui lòng nhập họ tên")
      .max(50, "Không quá 50 ký tự"),

    email: z.string().email("Email không hợp lệ"),

    phone: z
      .string()
      .optional()
      .refine((val) => !val || /^0\d{9}$/.test(val), {
        message: "Số điện thoại không hợp lệ",
      }),

    dob: z.string().optional(),

    bio: z
      .string()
      .max(160, "Tối đa 160 ký tự")
      .optional(),

    // ── GIỚI TÍNH ─────────────────────────────────────
    gender: z
      .enum(["Nam", "Nữa", "Khác", "Chưa cập nhật"], {
        message: "Vui lòng chọn giới tính hợp lệ",   // Message khi giá trị không nằm trong enum
      })
      .optional()
      .default("Chưa cập nhật"),

    avatar: z.any().optional(),
    coverImage: z.any().optional(),

    // 🔐 Password
    currentPassword: z.string().optional(),

    newPassword: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 8, {
        message: "Mật khẩu mới phải ít nhất 8 ký tự",
      }),

    confirmNewPassword: z.string().optional(),
  })

  // 🔥 Logic validate chéo (giữ nguyên)
  .refine(
    (data) => !data.newPassword || !!data.currentPassword,
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
  )

  .refine(
    (data) => !data.newPassword || passwordValidation.safeParse(data.newPassword).success,
    {
      message: "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa và 1 số",
      path: ["newPassword"],
    }
  );

export type ProfileFormData = z.infer<typeof profileSchema>;