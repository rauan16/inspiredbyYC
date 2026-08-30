"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = new FormData(form);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");

    setLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/app");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка входа";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="С возвращением"
      subtitle="Войди, чтобы продолжить строить свой путь."
      footer={
        <>
          Нет аккаунта?{" "}
          <Link href="/signup" className="font-medium text-ink underline underline-offset-2">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field id="email" name="email" label="Email" type="email" placeholder="you@example.com" required />
        <div>
          <Field id="password" name="password" label="Пароль" type="password" placeholder="••••••••" required />
          <Link
            href="/forgot-password"
            className="mt-2 inline-block text-[12.5px] text-ink-soft underline underline-offset-2 hover:text-ink"
          >
            Забыли пароль?
          </Link>
        </div>
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </Button>
        {error && <p className="text-[12px] text-red" role="alert">{error}</p>}
      </form>
    </AuthShell>
  );
}
