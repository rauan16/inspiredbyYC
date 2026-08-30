const problems = [
  { emoji: "🔒", title: "Нет доступа", description: "К консультантам и структурированной информации", tone: "bg-red text-white", sub: "text-white/85", number: "text-white/65" },
  { emoji: "🧭", title: "Сложно понять", description: "Что важно для поступления и как правильно развиваться", tone: "bg-yellow text-ink", sub: "text-ink/75", number: "text-ink/60" },
  { emoji: "⏳", title: "Упускают возможности", description: "Из-за дедлайнов, нехватки ресурсов и опыта", tone: "bg-blue text-white", sub: "text-white/85", number: "text-white/65" },
];

export function Problem() {
  return (
    <section id="problem" className="relative overflow-hidden border-y border-line/70 bg-paper-dim/60 py-20 md:py-28">
      <div className="pointer-events-none absolute -right-24 top-10 h-64 w-64 rounded-full border-[36px] border-yellow/20" />
      <div className="container-ulys relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
        <div>
          <div className="mb-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-red">Почему это важно</div>
          <h2 className="max-w-xl font-display text-[30px] font-bold leading-[1.1] tracking-tight md:text-[42px]">
            Будущее не должно зависеть от места,
            <span className="mt-1 block text-red">где ты родился.</span>
          </h2>
          <p className="mt-7 max-w-lg text-[15px] leading-relaxed text-ink-soft md:text-[16px]">Сегодня доступ к образованию и возможностям часто зависит от города, окружения и связей.</p>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft md:text-[16px]">У кого-то есть репетиторы, менторы и поддержка. А кто-то с таким же потенциалом узнаёт о важных олимпиадах, грантах и программах слишком поздно.</p>
          <p className="mt-8 inline-flex rounded-full border border-red bg-red px-4 py-2 font-display text-[15px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(226,56,43,0.8)] md:text-[17px]">ULYS меняет это</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {problems.map((problem, index) => (
            <article key={problem.title} className={`group relative min-h-[230px] overflow-hidden rounded-[24px] border border-line/80 ${problem.tone} p-5 shadow-[0_18px_35px_-24px_rgba(23,21,31,0.5)] transition-transform duration-300 hover:-translate-y-2 md:p-6`}>
              <span className={`absolute right-5 top-4 font-mono text-[11px] ${problem.number}`}>0{index + 1}</span>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-paper text-[24px]">{problem.emoji}</span>
              <h3 className="mt-8 font-display text-[16px] font-bold leading-snug md:text-[17px]">{problem.title}</h3>
              <p className={`mt-3 text-[13px] leading-relaxed md:text-[13.5px] ${problem.sub}`}>{problem.description}</p>
              <span className="absolute -bottom-8 -right-5 text-[92px] font-bold leading-none text-paper/50">{index + 1}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
