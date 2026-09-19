"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const LandingReveal = forwardRef<HTMLElement, {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
} & HTMLAttributes<HTMLElement>>(({
  as: Tag = "div",
  children,
  className,
  delay = 0,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  const setRef = (node: HTMLElement | null) => {
    internalRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    const element = internalRef.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={setRef}
      className={cn("landing-reveal", visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  );
});

LandingReveal.displayName = "LandingReveal";
