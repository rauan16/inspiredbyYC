import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 md:p-12">
        <Link href="/" className="font-display text-[20px] font-bold">
          ULYS
        </Link>

        <div className="mx-auto w-full max-w-sm py-10">
          <h1 className="font-display text-[26px] font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-[14px] text-ink-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-[13.5px] text-ink-soft">{footer}</div>}
        </div>

        <p className="text-[12px] text-ink-soft">© 2026 ULYS</p>
      </div>

      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(circle at 20% 25%, rgba(226,56,43,0.4), transparent 45%), radial-gradient(circle at 80% 75%, rgba(52,87,234,0.4), transparent 45%), radial-gradient(circle at 55% 15%, rgba(243,195,24,0.3), transparent 40%)",
          }}
        />
        <div className="relative flex h-full flex-col items-start justify-end p-14">
          <p className="font-display text-[32px] font-bold leading-tight text-paper">
            Твои возможности.
            <br />
            Твой путь.
          </p>
          <p className="mt-4 max-w-sm text-[14px] text-paper/70">
            Присоединяйся к школьникам, которые уже строят свой путь к
            поступлению с ULYS.
          </p>
        </div>
      </div>
    </div>
  );
}
