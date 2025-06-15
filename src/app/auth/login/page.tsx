'use client';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof LoginSchema>;

interface LoginFormProps {
  onClose: () => void;
  onLoginSuccess: () => void; // 👈 Gọi callback khi login thành công
}

export default function LoginForm({ onClose, onLoginSuccess }: LoginFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
  });

  const [serverError, setServerError] = useState("");

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError("");
      const res = await fetch("/api/auths/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Đã xảy ra lỗi không xác định");
        return;
      }

     
      localStorage.setItem("token", result.token);
      localStorage.setItem("userEmail", result.user.email);

      alert("Đăng nhập thành công!");
      onClose();
      onLoginSuccess(); //
      router.push("/");
      window.location.reload();

    } catch (error) {
      console.error("Login error:", error);
      setServerError("Không thể kết nối đến máy chủ.");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/20 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4">Đăng nhập</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label>Email</label>
            <input {...register("email")} className="border p-2 w-full" />
            {errors.email && (
              <p className="text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              {...register("password")}
              className="border p-2 w-full"
            />
            {errors.password && (
              <p className="text-red-500">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <div className="text-red-600 font-medium">{serverError}</div>
          )}

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
