import { TopBar } from "@/components/app/TopBar";
import { OpportunityCard } from "@/components/app/OpportunityCard";
import { opportunities } from "@/data/opportunities";
import { universities } from "@/data/universities";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.toLowerCase();

  const matchedOpportunities = query
    ? opportunities.filter((o) => `${o.title} ${o.organization}`.toLowerCase().includes(query))
    : [];
  const matchedUniversities = query
    ? universities.filter((u) => `${u.name} ${u.location}`.toLowerCase().includes(query))
    : [];

  return (
    <>
      <TopBar title="Поиск" />
      <div className="flex-1 space-y-8 px-5 py-6 lg:px-8 lg:py-8">
        <form className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 sm:max-w-lg">
          <SearchIcon className="h-4 w-4 text-ink-soft" />
          <input
            name="q"
            defaultValue={q}
            type="text"
            placeholder="Возможности, университеты, программы..."
            className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-ink-soft/70"
          />
        </form>

        {!query && (
          <p className="text-[13.5px] text-ink-soft">
            Начни печатать, чтобы найти возможности, университеты, программы и стипендии.
          </p>
        )}

        {query && (
          <>
            <section>
              <h2 className="font-display text-[15px] font-semibold">
                Возможности ({matchedOpportunities.length})
              </h2>
              {matchedOpportunities.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {matchedOpportunities.map((o) => (
                    <OpportunityCard key={o.id} opportunity={o} />
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-ink-soft">Ничего не найдено.</p>
              )}
            </section>

            <section>
              <h2 className="font-display text-[15px] font-semibold">
                Университеты ({matchedUniversities.length})
              </h2>
              {matchedUniversities.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {matchedUniversities.map((u) => (
                    <Link
                      key={u.id}
                      href={`/app/universities/${u.id}`}
                      className="rounded-[var(--radius-card)] border border-line bg-white p-5"
                    >
                      <p className="font-display text-[15px] font-semibold">{u.name}</p>
                      <p className="mt-1 text-[12px] text-ink-soft">{u.location}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-[13px] text-ink-soft">Ничего не найдено.</p>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}
