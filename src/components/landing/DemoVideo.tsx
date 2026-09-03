"use client";

import { Play } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export function DemoVideo() {
  return (
    <section id="demo" className="py-16 md:py-20">
      <div className="container-ulys">
        <SectionHeading
          title="Посмотри, как работает ULYS"
          align="center"
          className="mx-auto"
        />
        <p className="mx-auto mt-3 max-w-2xl text-center text-[14px] leading-relaxed text-ink-soft">
          Платформа в действии: поиск возможностей, AI-наставник и конструктор
          портфолио для подготовки к поступлению.
        </p>

        <button
          type="button"
          className="group relative mx-auto mt-10 flex aspect-video w-full max-w-4xl items-center justify-center overflow-hidden rounded-[28px] border-2 border-white shadow-[0_24px_50px_rgba(41,37,34,0.12)]"
          aria-label="Воспроизвести демо-видео ULYS"
        >
          <span className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-blue" />
          <span className="absolute inset-0 opacity-30">
            <span className="absolute top-8 left-8 h-2 w-2 rounded-full bg-white/20" />
            <span className="absolute top-8 right-8 h-2 w-2 rounded-full bg-white/20" />
            <span className="absolute bottom-8 left-8 h-2 w-2 rounded-full bg-white/20" />
            <span className="absolute bottom-8 right-8 h-2 w-2 rounded-full bg-white/20" />
          </span>

          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_12px_30px_rgba(226,56,43,0.4)] transition-transform duration-200 group-hover:scale-105">
            <Play className="ml-1 h-7 w-7 fill-red text-red md:h-8 md:w-8" />
          </span>

          <span className="absolute bottom-6 left-6 text-[13px] font-medium text-white/60">
            Демо · 1:30
          </span>
        </button>
      </div>
    </section>
  );
}
