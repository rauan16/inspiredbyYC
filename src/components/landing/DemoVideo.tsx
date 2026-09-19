import {
  ArrowUpRight,
  Bell,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Compass,
  FileText,
  LayoutGrid,
  Search,
  Sparkles,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const stats = [
  ["Возможности", "24", "+4 сегодня", "w-4/5"],
  ["Сохранено", "8", "+2 за неделю", "w-3/5"],
  ["Дедлайн", "12 дней", "Global Challenge", "w-2/5"],
];

const recommendations = [
  ["AIMUN Volunteer Programme", "Волонтёрство · Алматы", "82%"],
  ["ICTJ International Olympiad", "Физика и математика · Онлайн", "76%"],
];

const portfolioSections = [
  ["Достижения", "90%"],
  ["Проекты", "68%"],
  ["Волонтёрство", "54%"],
];

export function DemoVideo() {
  return (
    <section id="demo" className="py-16 md:py-20">
      <div className="container-ulys">
        <SectionHeading title="Посмотри, как работает ULYS" align="center" className="mx-auto" />
        <p className="mx-auto mt-3 max-w-2xl text-center text-[14px] leading-relaxed text-ink-soft">
          Платформа в действии: поиск возможностей, AI-наставник и конструктор портфолио для подготовки к поступлению.
        </p>

        <div className="mx-auto mt-10 w-full max-w-5xl overflow-hidden rounded-[28px] border-2 border-white bg-[#eee5da] p-2 shadow-[0_24px_50px_rgba(41,37,34,0.14)] sm:p-3" role="img" aria-label="Дашборд ULYS с возможностями, дедлайнами и портфолио">
          <div className="overflow-hidden rounded-[21px] border border-line/80 bg-[#f9f6f1] shadow-[0_14px_30px_rgba(41,37,34,0.08)]">
            <div className="flex min-h-[390px] sm:min-h-[440px]">
              <aside className="hidden w-[168px] shrink-0 border-r border-line/70 bg-white/75 p-4 sm:block">
                <div className="flex items-center gap-2 font-display text-[14px] font-bold tracking-[-0.06em]"><span className="flex h-7 w-7 items-center justify-center rounded-xl bg-red text-[11px] text-white">U</span>ULYS</div>
                <div className="mt-9 space-y-1.5 text-[10px] font-medium text-ink-soft">
                  <div className="flex items-center gap-2 rounded-xl bg-ink px-2.5 py-2 text-paper"><LayoutGrid className="h-3.5 w-3.5" /> Дашборд</div>
                  <div className="flex items-center gap-2 px-2.5 py-2"><Compass className="h-3.5 w-3.5" /> Возможности</div>
                  <div className="flex items-center gap-2 px-2.5 py-2"><Sparkles className="h-3.5 w-3.5" /> AI Mentor</div>
                  <div className="flex items-center gap-2 px-2.5 py-2"><FileText className="h-3.5 w-3.5" /> Портфолио</div>
                  <div className="flex items-center gap-2 px-2.5 py-2"><Bookmark className="h-3.5 w-3.5" /> Сохранённое</div>
                </div>
                <div className="mt-12 flex items-center gap-2 border-t border-line/70 pt-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-red text-[8px] font-bold text-white">Г</span><span className="truncate text-[9px] font-medium">Гость</span></div>
              </aside>

              <div className="min-w-0 flex-1">
                <div className="flex h-14 items-center justify-between border-b border-line/70 bg-white/60 px-4 sm:px-6">
                  <div className="flex items-center gap-2.5"><p className="font-display text-[12px] font-semibold sm:text-[14px]">Привет, Гость!</p><span className="hidden items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[8px] font-medium text-green-700 sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Онлайн</span></div>
                  <div className="flex items-center gap-2"><div className="hidden items-center gap-2 rounded-xl border border-line/70 bg-white px-3 py-2 text-[9px] text-ink-soft md:flex"><Search className="h-3 w-3" /> Поиск возможностей...</div><Bell className="h-4 w-4 text-ink-soft" /><span className="flex h-7 w-7 items-center justify-center rounded-full bg-yellow text-[9px] font-semibold">Г</span></div>
                </div>

                <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
                  <div className="rounded-2xl border border-line/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(244,232,216,0.95))] p-4 sm:p-5">
                    <div className="flex items-end justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-soft">Твой поток</p><p className="mt-1.5 font-display text-[15px] font-semibold tracking-[-0.05em] sm:text-[18px]">Двигайся к целям быстрее.</p><p className="mt-2 max-w-md text-[10px] leading-relaxed text-ink-soft sm:text-[11px]">Подборки возможностей, дедлайны и рекомендации собраны в одном месте.</p></div><Sparkles className="hidden h-7 w-7 shrink-0 text-red sm:block" /></div>
                    <div className="mt-4 grid grid-cols-3 gap-2">{stats.map(([label, value, note, width]) => (<div key={label} className="rounded-xl border border-line/60 bg-white/70 p-2.5 sm:p-3"><p className="text-[8px] uppercase tracking-[0.1em] text-ink-soft">{label}</p><p className="mt-1.5 font-display text-[13px] font-semibold sm:text-[16px]">{value}</p><div className="mt-2 h-1 overflow-hidden rounded-full bg-paper-dim"><div className={`h-full rounded-full bg-red ${width}`} /></div><p className="mt-1.5 truncate text-[8px] text-ink-soft">{note}</p></div>))}</div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
                    <div className="rounded-2xl border border-line/70 bg-white/70 p-4"><div className="flex items-center justify-between"><p className="font-display text-[11px] font-semibold sm:text-[13px]">Рекомендовано для тебя</p><ArrowUpRight className="h-3.5 w-3.5 text-ink-soft" /></div><div className="mt-3 space-y-2">{recommendations.map(([title, subtitle, match]) => (<div key={title} className="flex items-center gap-2.5 rounded-xl bg-paper-dim/70 p-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow text-[10px] font-display font-bold text-ink">{title[0]}</span><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-medium">{title}</p><p className="mt-0.5 truncate text-[8px] text-ink-soft">{subtitle}</p><span className="mt-1 inline-flex rounded-full bg-white/80 px-1.5 py-0.5 text-[7px] text-ink-soft">Подходит тебе</span></div><span className="text-[9px] font-semibold text-red">{match}</span></div>))}</div></div>

                    <div className="rounded-2xl border border-line/70 bg-white/70 p-4"><p className="font-display text-[11px] font-semibold sm:text-[13px]">Твоё портфолио</p><div className="mt-3 flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-full border-[5px] border-red"><span className="font-display text-[11px] font-bold">72%</span></div><p className="text-[9px] leading-relaxed text-ink-soft">Заполнено на 72%. Ещё немного до сильного профиля.</p></div><div className="mt-4 space-y-1.5">{portfolioSections.map(([label, value]) => (<div key={label} className="flex items-center gap-2 text-[8px] text-ink-soft"><span className="w-16 shrink-0">{label}</span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-dim"><div className="h-full rounded-full bg-red" style={{ width: value }} /></div><span className="w-6 text-right">{value}</span></div>))}</div><div className="mt-3 flex items-center gap-1.5 text-[9px] font-medium text-green-700"><CheckCircle2 className="h-3 w-3" /> 4 раздела заполнено</div></div>
                  </div>

                  <div className="hidden items-center justify-between rounded-2xl border border-line/70 bg-yellow-dim px-4 py-3 sm:flex"><div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-red" /><span className="text-[10px] font-medium">Ближайший дедлайн: Global Challenge</span></div><span className="text-[9px] font-semibold text-red">через 12 дней</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
