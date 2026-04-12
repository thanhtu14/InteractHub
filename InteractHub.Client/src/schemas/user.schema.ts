import { z } from "zod";

// Logic validate mật khẩu mạnh (dùng chung)
export const passwordValidation = z
  .string()
  .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
  .regex(/[A-Z]/, "Phải có ít nhất 1 chữ cái viết hoa")
  .regex(/[0-9]/, "Phải có ít nhất 1 chữ số")
  .regex(/[^a-zA-Z0-9]/, "Phải có ít nhất 1 ký tự đặc biệt");

// ── 1. SCHEMA NHẬN DỮ LIỆU TỪ API (User Entity) ──────────────────
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
  Roles: z.array(z.string()).default(["User"]),
  FriendshipStatus: z.string().optional().nullable(),
});

export type User = z.infer<typeof userSchema>;

// ── 2. SCHEMA DÙNG CHO FORM CẬP NHẬT (Profile Update) ──────────
export const profileUpdateSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Vui lòng nhập họ tên")
      .max(100, "Họ tên không quá 100 ký tự"),

    email: z.string().email("Email không hợp lệ"),

    phone: z
      .string()
      .optional()
      .nullable()
      .refine((val) => !val || /^0\d{9}$/.test(val), {
        message: "Số điện thoại phải gồm 10 số và bắt đầu bằng số 0",
      }),

    dob: z.string().optional().nullable(),

    bio: z
      .string()
      .max(500, "Tiểu sử tối đa 500 ký tự")
      .optional()
      .nullable(),

    gender: z
      .enum(["Nam", "Nữ", "Khác", "Chưa cập nhật"])
      .default("Chưa cập nhật"),

    // Mật khẩu (Cho phép trống hoàn toàn)
    currentPassword: z.string().optional().or(z.literal("")),
    newPassword: z.string().optional().or(z.literal("")),
    confirmNewPassword: z.string().optional().or(z.literal("")),
  })
  // Validation phụ thuộc: Nếu nhập pass mới thì bắt buộc nhập pass cũ
  .refine((data) => {
    if (data.newPassword && data.newPassword.length > 0) {
      return !!data.currentPassword && data.currentPassword.length > 0;
    }
    return true;
  }, {
    message: "Vui lòng nhập mật khẩu hiện tại để xác nhận đổi",
    path: ["currentPassword"],
  })
  // Validation phụ thuộc: Khớp mật khẩu
  .refine((data) => {
    if (data.newPassword && data.newPassword.length > 0) {
      return data.newPassword === data.confirmNewPassword;
    }
    return true;
  }, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmNewPassword"],
  })
  // Validation phụ thuộc: Độ mạnh mật khẩu
  .refine((data) => {
    if (data.newPassword && data.newPassword.length > 0) {
      const result = passwordValidation.safeParse(data.newPassword);
      return result.success;
    }
    return true;
  }, {
    message: "Mật khẩu mới chưa đủ mạnh (8 ký tự, 1 hoa, 1 số, 1 ký tự đặc biệt)",
    path: ["newPassword"],
  });

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;