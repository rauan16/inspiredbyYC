import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-24">
      <div className="container-ulys">
        <div className="rounded-[32px] bg-ink px-8 py-16 text-center md:px-16 md:py-20">
          <h2 className="font-display text-[30px] font-bold tracking-tight text-paper md:text-[40px]">
            Начни строить свой путь.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-paper/70">
            Находи возможности, собирай портфолио и узнавай, что делать
            дальше — уже сегодня.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/signup" variant="accent" size="lg" className="group">
              Начать
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
