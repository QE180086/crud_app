'use client';

import RegisterForm from "@/app/component/RegisterForm";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <RegisterForm onClose={() => router.push("/")} />
    </div>
  );
}
