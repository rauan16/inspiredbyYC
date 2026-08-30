import { ButtonLink } from "@/components/ui/Button";
import { PhoneFrame } from "./PhoneFrame";
import { MiniOppTile } from "./MiniOppTile";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="flex min-h-0 items-start overflow-hidden py-12 md:min-h-screen md:items-center md:py-20">
      <div className="container-ulys grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
        <div className="min-w-0 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-[12px] font-medium text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-red" />
            Для школьников Казахстана
          </span>
          <h1 className="mt-6 font-display text-[42px] font-bold leading-[1.08] tracking-tight sm:text-[50px] lg:text-[56px]">
            Твой путь в сильные университеты <span className="text-red">начинается здесь</span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-[16px] leading-relaxed text-ink-soft">
            ULYS помогает находить нужные возможности, собирать сильное портфолио
            и понимать, что улучшить для поступления в университет.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/signup" size="lg" className="group">
              Начать
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink href="#opportunities" variant="secondary" size="lg">
              Смотреть возможности
            </ButtonLink>
          </div>
        </div>

        <div className="min-w-0 flex justify-center pt-8 lg:justify-end lg:pt-12">
          <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-5">
            <PhoneFrame className="phone-float-delayed translate-y-8" frame="red">
              <div className="flex h-full flex-col gap-1.5 pt-1">
                <div className="flex items-center gap-2 border-b border-line pb-1.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red text-[9px] font-bold text-white">U</span>
                  <div>
                    <p className="font-display text-[11px] font-semibold">ULIE</p>
                    <p className="text-[7px] text-ink-soft">Твой персональный помощник</p>
                  </div>
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green" />
                </div>
                <div className="flex-1 space-y-1.5 overflow-hidden text-[8px] leading-[1.25]">
                  <div className="ml-6 rounded-xl rounded-tr-sm bg-red px-2.5 py-1.5 text-white">
                    Можешь дать совет по портфолио?
                  </div>
                  <div className="mr-5 rounded-xl rounded-tl-sm bg-yellow px-2.5 py-1.5 text-ink">
                    <strong>ULIE:</strong> Куда ты хочешь поступить?
                  </div>
                  <div className="ml-6 rounded-xl rounded-tr-sm bg-red px-2.5 py-1.5 text-white">
                    <strong>Ученик:</strong> В сильный университет за рубежом.
                  </div>
                  <div className="mr-5 rounded-xl rounded-tl-sm bg-yellow px-2.5 py-1.5 text-ink">
                    <strong>ULIE:</strong> Поняла. А что тебе интересно?
                  </div>
                  <div className="ml-6 rounded-xl rounded-tr-sm bg-red px-2.5 py-1.5 text-white">
                    <strong>Ученик:</strong> AI и предпринимательство.
                  </div>
                  <div className="mr-5 rounded-xl rounded-tl-sm bg-yellow px-2.5 py-1.5 text-ink">
                    <strong>ULIE:</strong> Тогда я помогу построить профиль сильного кандидата.
                  </div>
                  <div className="mr-2 rounded-xl rounded-tl-sm bg-yellow px-2.5 py-1.5 text-ink">
                    <strong>Твой путь:</strong><br />
                    🎯 Top 100 University<br />
                    📚 SAT 1500+<br />
                    🚀 AI-проект + соревнования<br />
                    🌎 Олимпиады, гранты, программы
                  </div>
                  <div className="mr-4 rounded-xl rounded-tl-sm bg-ink px-2.5 py-1.5 font-semibold text-white">
                    Создать персональный путь →
                  </div>
                </div>
                <div className="flex h-7 items-center rounded-full bg-paper-dim px-3 text-[7px] text-ink-soft">
                  Напиши сообщение...
                  <span className="ml-auto text-[10px] text-red">↑</span>
                </div>
              </div>
            </PhoneFrame>

            <PhoneFrame className="phone-float" frame="red">
              <div className="flex h-full flex-col gap-3 pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-medium text-ink-soft">Доброе утро</p>
                    <p className="mt-1 font-display text-[13px] font-semibold">Привет, Гость!</p>
                  </div>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red font-display text-[10px] font-bold text-white">Г</span>
                </div>
                <div className="flex gap-1.5 overflow-hidden border-b border-line pb-3">
                  {["Главная", "Сегодня", "Еще"].map((t, i) => (
                    <span
                      key={t}
                      className={
                        i === 0
                          ? "whitespace-nowrap rounded-full bg-red px-3 py-1.5 text-[9px] font-semibold text-white"
                          : "whitespace-nowrap rounded-full bg-paper-dim px-3 py-1.5 text-[9px] font-medium text-ink-soft"
                      }
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[8px] font-medium uppercase tracking-[0.12em] text-ink-soft">Подборка для тебя</p>
                    <p className="mt-1 font-display text-[12px] font-semibold">В топе сегодня</p>
                  </div>
                  <span className="text-[8px] font-medium text-ink-soft">3 возможности</span>
                </div>
                <div className="space-y-2.5">
                  <MiniOppTile
                    title="AIMUN Volunteer Programme"
                    sub="Волонтёрство · Алматы · Сертификат"
                    color="yellow"
                    saved
                  />
                  <MiniOppTile
                    title="ICTJ International Olympiad"
                    sub="Физика и математика · Онлайн · 8–11 класс"
                    color="red-ink"
                  />
                  <MiniOppTile
                    title="Almaty Fest Volunteering"
                    sub="Городской фестиваль · Алматы · 14+ лет"
                    color="yellow"
                    saved
                  />
                </div>
              </div>
            </PhoneFrame>
          </div>
        </div>
      </div>
    </section>
  );
}
