'use client';

import LoginForm from "@/app/component/LoginForm";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <LoginForm
      onClose={() => router.push("/")}
      onLoginSuccess={() => router.push("/")}
    />
  );
}
