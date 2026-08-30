import { universities } from "@/data/universities";

export function UniversityPreview() {
  const u = universities[1];

  return (
    <section id="universities" className="py-14 md:py-16">
      <div className="container-ulys grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 rounded-[var(--radius-card)] border border-line bg-white p-6 lg:order-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-[16px] font-semibold">{u.name}</p>
              <p className="text-[12px] text-ink-soft">
                {u.location}, {u.country}
              </p>
            </div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-blue">
              <span className="font-display text-[15px] font-bold text-blue">
                {u.analysis.profileMatch}%
              </span>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-paper-dim px-3.5 py-3">
              <p className="text-[10.5px] text-ink-soft">Академическое соответствие</p>
              <p className="mt-1 font-display text-[13.5px] font-semibold">{u.analysis.academicFit}</p>
            </div>
            <div className="rounded-xl bg-paper-dim px-3.5 py-3">
              <p className="text-[10.5px] text-ink-soft">Сила заявки</p>
              <p className="mt-1 font-display text-[13.5px] font-semibold">
                {u.analysis.applicationStrength}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-medium text-ink-soft">Рекомендации</p>
            <ul className="mt-2 space-y-1.5">
              {u.analysis.recommendations.map((r) => (
                <li key={r} className="text-[12.5px] leading-snug text-ink">
                  · {r}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-[10.5px] text-ink-soft">
            Оценка — ориентир, не гарантия поступления.
          </p>
        </div>

        <div className="order-1 lg:order-2">
          <span className="font-mono text-[11px] font-medium text-red">ПРОФИЛЬ / АНАЛИЗ УНИВЕРСИТЕТОВ</span>
          <h3 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-tight md:text-[30px]">
            Узнай, насколько ты готов уже сейчас.
          </h3>
          <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
            Выбери университеты — ULYS покажет совпадение профиля, сильные
            стороны и то, над чем стоит поработать до подачи заявки.
          </p>
          <ul className="mt-5 flex flex-col gap-2 text-[13.5px] text-ink-soft">
            <li>— Profile Match по каждому университету</li>
            <li>— Академическое соответствие и сила заявки</li>
            <li>— Конкретные рекомендации, а не проценты «на удачу»</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
