'use client';

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { RegisterSchema } from "@/lib/validation/auth.schema";

type RegisterFormData = z.infer<typeof RegisterSchema>;

interface RegisterFormProps {
  onClose: () => void;
}

export default function RegisterForm({ onClose }: RegisterFormProps) {
  const router = useRouter(); 
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auths/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const contentType = res.headers.get("content-type");
      let result = null;

      if (contentType && contentType.includes("application/json")) {
        result = await res.json();
      }

      if (!res.ok) {
        alert(result?.error || "Đăng ký thất bại");
        return;
      }

      alert("Đăng ký thành công!");
      onClose();
      router.push("/");
    } catch (error) {
      alert("Lỗi khi kết nối đến server.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Username</label>
        <input {...register("name")} className="border p-2 w-full" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label>Email</label>
        <input {...register("email")} className="border p-2 w-full" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>

      <div>
        <label>Password</label>
        <input type="password" {...register("password")} className="border p-2 w-full" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? "Đang đăng ký..." : "Register"}
      </button>
    </form>
  );
}
