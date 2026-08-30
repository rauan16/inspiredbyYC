"use client";

import { Play } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

export function DemoVideo() {
  return (
    <section id="demo" className="py-16 md:py-20">
      <div className="container-ulys">
        <SectionHeading title="Посмотри, как работает ULYS" align="center" className="mx-auto" />

        {/* Replace this placeholder with a real player: YouTube embed, Vimeo, or <video src="..."> */}
        <button
          type="button"
          className="group relative mx-auto mt-10 flex aspect-video w-full max-w-4xl items-center justify-center overflow-hidden rounded-[28px] bg-ink"
          aria-label="Воспроизвести демо-видео ULYS"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white transition-transform duration-200 group-hover:scale-105 md:h-20 md:w-20">
            <Play className="ml-1 h-6 w-6 fill-ink text-ink md:h-7 md:w-7" />
          </span>
          <span className="absolute bottom-5 left-6 text-[13px] font-medium text-white/60">
            Демо · 1:30
          </span>
        </button>
      </div>
    </section>
  );
}
