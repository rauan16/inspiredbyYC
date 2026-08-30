import { cn } from "@/lib/utils";
import Link from "next/link";
import { ButtonHTMLAttributes } from "react";

/**
 * Button hierarchy (see design system):
 * - primary:   strongest weight, one per view — main action (red fill)
 * - secondary: subtle, bordered — alternate action
 * - tertiary:  text/icon only — low-emphasis action
 * - accent:    for use on dark/ink surfaces where "primary" would be invisible
 */
type Variant = "primary" | "secondary" | "tertiary" | "accent";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-red text-white hover:bg-red/90 active:bg-red/80 disabled:bg-red/40",
  secondary:
    "bg-transparent text-ink border border-line hover:border-ink/50 active:bg-ink/5 disabled:opacity-40",
  tertiary:
    "bg-transparent text-ink-soft hover:text-ink hover:bg-ink/5 active:bg-ink/10 disabled:opacity-40",
  accent:
    "bg-yellow text-ink hover:bg-yellow/85 active:bg-yellow/70 disabled:bg-yellow/40",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-12 px-7 text-[15px]",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-150 whitespace-nowrap disabled:pointer-events-none";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: BaseProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: BaseProps & { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
    </Link>
  );
}
