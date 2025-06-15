import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải ít nhất 6 ký tự" }),
  name: z.string().min(3, { message: "Tên người dùng phải ít nhất 3 ký tự" }),
});
export const LoginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải ít nhất 6 ký tự" }),
});