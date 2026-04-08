import { z } from "zod";

// 🔐 Password dùng chung
export const passwordValidation = z
  .string()
  .min(1, "Vui lòng nhập mật khẩu")
  .min(8, "Mật khẩu phải ít nhất 8 ký tự")
  .regex(/[A-Z]/, "Phải có ít nhất 1 chữ hoa")
  .regex(/[0-9]/, "Phải có ít nhất 1 chữ số");
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(6, "Mật khẩu phải ít nhất 6 ký tự"),
  rememberMe: z.boolean().optional(),
});
// 📝 Register
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Vui lòng nhập họ tên")
      .min(3, "Ít nhất 3 ký tự")
      .max(50, "Không quá 50 ký tự"),

    email: z
      .string()
      .min(1, "Vui lòng nhập email")
      .email("Email không hợp lệ"),

    password: passwordValidation,

    confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// 📩 Forgot Password
export const emailStepSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

export const otpStepSchema = z.object({
  otp: z.string().length(6, "Mã xác thực phải đủ 6 số"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordValidation,
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

// ── Export type để dùng trong React Hook Form ─────────────────────
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
// Optional: export thêm các type khác nếu sau này cần
export type EmailStepData = z.infer<typeof emailStepSchema>;
export type OtpStepData = z.infer<typeof otpStepSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;