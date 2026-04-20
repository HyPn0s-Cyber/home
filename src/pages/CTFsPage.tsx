import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Trophy,
  Calendar,
  Users,
  User,
  Hash,
  Award,
  Target,
  CircleDot,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import SectionTitle from '../components/SectionTitle';
import CategoryBadge from '../components/CategoryBadge';
import rawCtfs from '../data/ctfs.json';

type CTF = {
  id: string;
  name: string;
  fullName?: string;
  date: string;
  dateEnd?: string;
  team?: string;
  mode: 'solo' | 'team';
  teamRank?: number;
  teamTotal?: number;
  individualRank?: number;
  individualTotal?: number;
  points?: number;
  categories?: string[];
  badge?: string;
  badgeDate?: string;
  notes?: string;
};

const ctfs = rawCtfs as CTF[];

type Filter = 'all' | 'solo' | 'team';

function formatDateRange(start: string, end?: string) {
  const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const s = new Date(start);
  if (!end) return s.toLocaleDateString('en-US', opts);
  const e = new Date(end);
  const sameMonth = s.getUTCMonth() === e.getUTCMonth() && s.getUTCFullYear() === e.getUTCFullYear();
  if (sameMonth) {
    const month = s.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return `${s.getUTCDate()}–${e.getUTCDate()} ${month}`;
  }
  return `${s.toLocaleDateString('en-US', opts)} → ${e.toLocaleDateString('en-US', opts)}`;
}

function yearOf(ctf: CTF) {
  return new Date(ctf.date).getUTCFullYear();
}

export default function CTFsPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(() => {
    return ctfs
      .filter((c) => (filter === 'all' ? true : c.mode === filter))
      .filter((c) =>
        query.trim() === ''
          ? true
          : (c.name + ' ' + (c.team ?? '') + ' ' + (c.fullName ?? ''))
              .toLowerCase()
              .includes(query.toLowerCase()),
      )
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [query, filter]);

  // group by year for a timeline feel
  const groups = useMemo(() => {
    const out = new Map<number, CTF[]>();
    for (const c of filtered) {
      const y = yearOf(c);
      if (!out.has(y)) out.set(y, []);
      out.get(y)!.push(c);
    }
    return Array.from(out.entries()).sort((a, b) => b[0] - a[0]);
  }, [filtered]);

  const counts = {
    all: ctfs.length,
    solo: ctfs.filter((c) => c.mode === 'solo').length,
    team: ctfs.filter((c) => c.mode === 'team').length,
  };

  return (
    <PageTransition>
      <SectionTitle
        kicker="// archive"
        title="ctf history"
        hint={`${ctfs.length} competitions logged. Sorted by date, filterable by mode.`}
      />

      {/* controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a96a3]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="grep 'ctf name or team'..."
            className="w-full bg-[#0b0f14] border border-[#1a222d] rounded-sm font-mono text-sm px-10 py-2.5 text-[#d7e0e8] placeholder:text-[#4d5966] focus:outline-none focus:border-[#22ff9c]/60 focus:ring-1 focus:ring-[#22ff9c]/40 transition-colors"
          />
          <Hash className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#1a222d]" />
        </div>
        <div className="flex gap-2 font-mono text-xs">
          {(['all', 'solo', 'team'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-sm border uppercase tracking-widest transition-all ${
                filter === f
                  ? 'border-[#22ff9c]/60 text-[#22ff9c] bg-[#22ff9c]/5 border-neon-glow'
                  : 'border-[#1a222d] text-[#8a96a3] hover:text-[#d7e0e8] hover:border-[#2a3340]'
              }`}
            >
              {f} <span className="text-[#4d5966]">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* grouped grid */}
      {groups.map(([year, list], gi) => (
        <section key={year} className="mb-10">
          <div className="flex items-baseline gap-3 mb-4 font-mono">
            <h3 className="text-3xl font-bold text-[#b061ff] glow-violet">{year}</h3>
            <span className="text-[11px] uppercase tracking-widest text-[#4d5966]">
              // {list.length} event{list.length > 1 ? 's' : ''}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#1a222d] to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {list.map((ctf, i) => {
              const logo =
                ctf.mode === 'team'
                  ? '/assets/img/team-logo.svg'
                  : '/assets/img/solo-logo.svg';

              const teamPct =
                ctf.teamRank && ctf.teamTotal
                  ? Math.round((ctf.teamRank / ctf.teamTotal) * 100)
                  : null;
              const indivPct =
                ctf.individualRank && ctf.individualTotal
                  ? Math.round((ctf.individualRank / ctf.individualTotal) * 100)
                  : null;

              // pick the "headline" stat for the accent tag
              const hasResults =
                ctf.teamRank || ctf.individualRank || ctf.points;

              return (
                <motion.article
                  key={ctf.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(gi * 0.05 + i * 0.04, 0.5), duration: 0.4 }}
                  className="group relative bg-[#0b0f14] border border-[#1a222d] rounded-md p-5 hover:border-[#22ff9c] hover:shadow-[0_0_0_1px_rgba(34,255,156,0.6),0_0_24px_rgba(34,255,156,0.25)] transition-all duration-300"
                >
                  {/* mode tag */}
                  <div
                    className="absolute top-0 right-0 font-mono text-[10px] tracking-widest px-2 py-1 rounded-bl-md rounded-tr-md border-l border-b uppercase"
                    style={
                      ctf.mode === 'team'
                        ? {
                            color: '#22ff9c',
                            borderColor: 'rgba(34,255,156,0.35)',
                            backgroundColor: 'rgba(34,255,156,0.08)',
                          }
                        : {
                            color: '#b061ff',
                            borderColor: 'rgba(176,97,255,0.40)',
                            backgroundColor: 'rgba(176,97,255,0.08)',
                          }
                    }
                  >
                    {ctf.mode}
                  </div>

                  <header className="flex items-start gap-3 mb-4 pr-16">
                    <img
                      src={logo}
                      alt={ctf.team ?? 'solo'}
                      className="w-12 h-12 rounded-md shrink-0"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-mono text-lg sm:text-xl font-bold text-[#d7e0e8] group-hover:text-[#22ff9c] transition-colors"
                        title={ctf.fullName ?? ctf.name}
                      >
                        {ctf.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 font-mono text-[11px] text-[#8a96a3]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateRange(ctf.date, ctf.dateEnd)}
                        </span>
                        {ctf.team ? (
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span className="text-[#b061ff]">{ctf.team}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span className="text-[#b061ff]">solo</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </header>

                  {/* results */}
                  {hasResults ? (
                    <div className="grid grid-cols-3 gap-2 mb-4 font-mono">
                      {ctf.teamRank !== undefined ? (
                        <div className="bg-[#07090c] border border-[#1a222d] rounded-sm px-3 py-2">
                          <div className="text-[10px] uppercase tracking-wider text-[#8a96a3] flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> team
                          </div>
                          <div className="text-[#22ff9c] text-lg font-bold glow-neon leading-tight">
                            #{ctf.teamRank}
                            {ctf.teamTotal && (
                              <span className="text-[#4d5966] text-xs font-normal">
                                /{ctf.teamTotal}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#07090c]/40 border border-dashed border-[#1a222d] rounded-sm px-3 py-2 opacity-60">
                          <div className="text-[10px] uppercase tracking-wider text-[#4d5966] flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> team
                          </div>
                          <div className="text-[#4d5966] text-base font-bold">—</div>
                        </div>
                      )}

                      {ctf.individualRank !== undefined ? (
                        <div className="bg-[#07090c] border border-[#1a222d] rounded-sm px-3 py-2">
                          <div className="text-[10px] uppercase tracking-wider text-[#8a96a3] flex items-center gap-1">
                            <User className="w-3 h-3" /> solo
                          </div>
                          <div className="text-[#b061ff] text-lg font-bold glow-violet leading-tight">
                            #{ctf.individualRank}
                            {ctf.individualTotal && (
                              <span className="text-[#4d5966] text-xs font-normal">
                                /{ctf.individualTotal}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#07090c]/40 border border-dashed border-[#1a222d] rounded-sm px-3 py-2 opacity-60">
                          <div className="text-[10px] uppercase tracking-wider text-[#4d5966] flex items-center gap-1">
                            <User className="w-3 h-3" /> solo
                          </div>
                          <div className="text-[#4d5966] text-base font-bold">—</div>
                        </div>
                      )}

                      {ctf.points !== undefined ? (
                        <div className="bg-[#07090c] border border-[#1a222d] rounded-sm px-3 py-2">
                          <div className="text-[10px] uppercase tracking-wider text-[#8a96a3] flex items-center gap-1">
                            <Target className="w-3 h-3" /> points
                          </div>
                          <div className="text-[#d7e0e8] text-lg font-bold leading-tight">
                            {ctf.points.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#07090c]/40 border border-dashed border-[#1a222d] rounded-sm px-3 py-2 opacity-60">
                          <div className="text-[10px] uppercase tracking-wider text-[#4d5966] flex items-center gap-1">
                            <Target className="w-3 h-3" /> points
                          </div>
                          <div className="text-[#4d5966] text-base font-bold">—</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-4 font-mono text-[11px] text-[#4d5966] italic border border-dashed border-[#1a222d] rounded-sm px-3 py-2">
                      // results not recorded
                    </div>
                  )}

                  {/* percentile chips */}
                  {(teamPct !== null || indivPct !== null) && (
                    <div className="flex flex-wrap gap-2 mb-4 font-mono text-[10px]">
                      {teamPct !== null && (
                        <span className="px-2 py-0.5 rounded-sm border border-[#22ff9c]/30 text-[#22ff9c] bg-[#22ff9c]/5 uppercase tracking-widest">
                          team top {teamPct}%
                        </span>
                      )}
                      {indivPct !== null && (
                        <span className="px-2 py-0.5 rounded-sm border border-[#b061ff]/30 text-[#b061ff] bg-[#b061ff]/5 uppercase tracking-widest">
                          solo top {indivPct}%
                        </span>
                      )}
                    </div>
                  )}

                  {/* categories */}
                  {ctf.categories && ctf.categories.length > 0 && (
                    <div className="mb-3">
                      <div className="font-mono text-[10px] uppercase tracking-widest text-[#4d5966] mb-2">
                        // solved categories
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ctf.categories.map((k) => (
                          <CategoryBadge key={k} name={k} count={1} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* badge */}
                  {ctf.badge && (
                    <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-[#ffe066] border-t border-[#1a222d] pt-3">
                      <Award className="w-3.5 h-3.5" />
                      <span className="truncate">{ctf.badge}</span>
                    </div>
                  )}

                  {/* notes */}
                  {ctf.notes && !ctf.badge && (
                    <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-[#8a96a3] border-t border-[#1a222d] pt-3">
                      <CircleDot className="w-3 h-3" />
                      <span className="truncate">{ctf.notes}</span>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-20 font-mono text-[#8a96a3]">
          <div className="text-[#ff5c7a] mb-2">[!] no matches</div>
          <div className="text-sm">try another query or change the filter.</div>
        </div>
      )}
    </PageTransition>
  );
}
