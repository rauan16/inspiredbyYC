"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useState } from "react";
import { signup } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function SignupPage() {
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
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");

    if (!name || !email || !password) return;

    setLoading(true);
    setError("");

    try {
      await signup(email, password, name);
      router.push("/onboarding");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ошибка регистрации";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Создай аккаунт"
      subtitle="Начни находить возможности и строить портфолио."
      footer={
        <>
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-ink underline underline-offset-2">
            Войти
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field id="name" name="name" label="Имя" type="text" placeholder="Твоё имя" required />
        <Field id="email" name="email" label="Email" type="email" placeholder="you@example.com" required />
        <Field
          id="password"
          name="password"
          label="Пароль"
          type="password"
          placeholder="Минимум 8 символов"
          minLength={8}
          required
        />
        <Button type="submit" size="lg" className="mt-2 w-full" disabled={loading}>
          {loading ? "Создание..." : "Продолжить"}
        </Button>
        {error && <p className="text-[12px] text-red" role="alert">{error}</p>}
        <p className="text-[12px] leading-relaxed text-ink-soft">
          Регистрируясь, ты соглашаешься с{" "}
          <Link href="/terms" className="underline underline-offset-2">
            условиями использования
          </Link>{" "}
          и{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            политикой конфиденциальности
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
