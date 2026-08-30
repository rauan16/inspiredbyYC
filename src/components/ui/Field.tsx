import { cn } from "@/lib/utils";
import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Field({
  label,
  id,
  className,
  ...props
}: { label: string; id: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        className="h-11 rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none placeholder:text-ink-soft/60 focus:border-ink"
        {...props}
      />
    </div>
  );
}

export function TextAreaField({
  label,
  id,
  className,
  ...props
}: { label: string; id: string; className?: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        className="min-h-[96px] rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-ink-soft/60 focus:border-ink"
        {...props}
      />
    </div>
  );
}

export function SelectField({
  label,
  id,
  className,
  children,
  ...props
}: {
  label: string;
  id: string;
  className?: string;
  children: React.ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[13px] font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        className="h-11 rounded-xl border border-line bg-white px-3.5 text-[14px] text-ink outline-none focus:border-ink"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
