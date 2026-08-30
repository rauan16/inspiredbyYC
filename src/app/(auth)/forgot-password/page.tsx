import { AuthShell } from "@/components/auth/AuthShell";
import { Field } from "@/components/ui/Field";
import { ButtonLink } from "@/components/ui/Button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Восстановление пароля"
      subtitle="Укажи email — мы отправим ссылку для сброса пароля."
      footer={
        <Link href="/login" className="font-medium text-ink underline underline-offset-2">
          Вернуться ко входу
        </Link>
      }
    >
      <form className="flex flex-col gap-4">
        <Field id="email" label="Email" type="email" placeholder="you@example.com" required />
        <ButtonLink href="/forgot-password" size="lg" className="mt-2 w-full">
          Отправить ссылку
        </ButtonLink>
      </form>
    </AuthShell>
  );
}
