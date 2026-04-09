import { z } from "zod";
import { passwordValidation } from "./auth.schema";

// ── 1. SCHEMA DÙNG ĐỂ NHẬN DỮ LIỆU TỪ API (User Entity) ──────────
export const userSchema = z.object({
  Id: z.string(),
  Username: z.string(),
  Email: z.string().email(),
  Phone: z.string().optional().nullable(),
  AvatarUrl: z.string().optional().nullable(),
  CoverUrl: z.string().optional().nullable(),
  Bio: z.string().optional().nullable(),
  Gender: z.enum(["Nam", "Nữ", "Khác", "Chưa cập nhật"]).default("Chưa cập nhật"),
  DateOfBirth: z.string().optional().nullable(),
  CreatedAt: z.string().optional(),
  Roles: z.array(z.string()),
  FriendshipStatus: z.string().optional(), // Thêm dòng này để UI biết nên hiện nút gì
});

// Type dùng cho dữ liệu trả về từ backend
export type User = z.infer<typeof userSchema>;


// ── 2. SCHEMA DÙNG CHO FORM CẬP NHẬT (Profile Update) ──────────
export const profileUpdateSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Vui lòng nhập họ tên")
      .max(50, "Không quá 50 ký tự"),

    email: z.string().email("Email không hợp lệ"),

    phone: z
      .string()
      .optional()
      .nullable()
      .refine((val) => !val || /^0\d{9}$/.test(val), {
        message: "Số điện thoại không hợp lệ",
      }),

    dob: z.string().optional().nullable(),

    bio: z
      .string()
      .max(160, "Tối đa 160 ký tự")
      .optional()
      .nullable(),

    gender: z
      .enum(["Nam", "Nữ", "Khác", "Chưa cập nhật"], {
        message: "Vui lòng chọn giới tính hợp lệ",
      })
      .default("Chưa cập nhật"),

    // Các trường file (avatar/cover) thường dùng cho FormData
    avatar: z.any().optional(),
    coverImage: z.any().optional(),

    // Logic đổi mật khẩu
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  // Kiểm tra: Nếu nhập pass mới thì phải nhập pass cũ
  .refine((data) => !data.newPassword || !!data.currentPassword, {
    message: "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu",
    path: ["currentPassword"],
  })
  // Kiểm tra: Khớp mật khẩu mới
  .refine((data) => !data.newPassword || data.newPassword === data.confirmNewPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  })
  // Kiểm tra: Độ mạnh mật khẩu (dùng chung logic với auth.schema)
  .refine(
    (data) => !data.newPassword || passwordValidation.safeParse(data.newPassword).success,
    {
      message: "Mật khẩu mới phải ít nhất 8 ký tự, có chữ hoa và số",
      path: ["newPassword"],
    }
  );

// Type dùng cho React Hook Form
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;