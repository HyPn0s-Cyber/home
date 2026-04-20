import { motion } from 'framer-motion';
import {
  MapPin,
  CheckCircle2,
  Github,
  Linkedin,
  Flag,
  Trophy,
  Target,
  Medal,
  Users,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import CategoryBadge from '../components/CategoryBadge';
import profile from '../data/profile.json';
import rawCtfs from '../data/ctfs.json';

type CTF = {
  id: string;
  name: string;
  date: string;
  team?: string;
  mode: 'solo' | 'team';
  teamRank?: number;
  individualRank?: number;
  points?: number;
  categories?: string[];
};

const ctfs = rawCtfs as CTF[];

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
};

// Derive homepage stats directly from the CTF list so they never go stale.
function deriveStats() {
  const ctfsDone = ctfs.length;
  const teamsPlayed = new Set(
    ctfs.filter((c) => c.team).map((c) => c.team!.toLowerCase()),
  ).size;

  const teamRanks = ctfs.map((c) => c.teamRank).filter((x): x is number => !!x);
  const indivRanks = ctfs.map((c) => c.individualRank).filter((x): x is number => !!x);
  const bestTeamRank = teamRanks.length ? Math.min(...teamRanks) : null;
  const bestSoloRank = indivRanks.length ? Math.min(...indivRanks) : null;

  const totalPoints = ctfs.reduce((acc, c) => acc + (c.points ?? 0), 0);

  return { ctfsDone, teamsPlayed, bestTeamRank, bestSoloRank, totalPoints };
}

function categoryCounts(): Array<[string, number]> {
  const totals: Record<string, number> = {};
  ctfs.forEach((c) => {
    (c.categories ?? []).forEach((k) => {
      const key = k.trim();
      if (!key) return;
      totals[key] = (totals[key] || 0) + 1;
    });
  });
  return Object.entries(totals).sort((a, b) => b[1] - a[1]);
}

export default function HomePage() {
  const stats = deriveStats();
  const cats = categoryCounts();
  const maxCount = cats.length ? Math.max(...cats.map(([, v]) => v)) : 1;

  const statItems = [
    {
      label: 'CTFs Played',
      value: stats.ctfsDone,
      icon: Flag,
      color: '#22ff9c',
    },
    {
      label: 'Best Team Rank',
      value: stats.bestTeamRank !== null ? `#${stats.bestTeamRank}` : '—',
      icon: Trophy,
      color: '#ffe066',
    },
    {
      label: 'Best Solo Rank',
      value: stats.bestSoloRank !== null ? `#${stats.bestSoloRank}` : '—',
      icon: Medal,
      color: '#b061ff',
    },
    {
      label: 'Teams Played With',
      value: stats.teamsPlayed,
      icon: Users,
      color: '#56d1ff',
    },
  ];

  return (
    <PageTransition>
      {/* hero */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* bio */}
        <div className="lg:col-span-3 font-mono">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[#8a96a3] text-xs tracking-[0.3em] uppercase mb-4"
          >
            // whoami
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="block text-[#8a96a3] text-lg sm:text-xl font-normal mb-2"
            >
              Hello, I'm
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="block text-[#22ff9c] glow-neon"
            >
              {profile.realName}
              <span className="cursor-blink" />
            </motion.span>
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#8a96a3]">
            <span className="text-[#b061ff] glow-violet">{profile.role}</span>
            <span className="text-[#1a222d]">|</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {profile.location}
            </span>
            <span className="text-[#1a222d]">|</span>
            <span className="inline-flex items-center gap-1 text-[#22ff9c]">
              <CheckCircle2 className="w-3.5 h-3.5" /> {profile.availability}
            </span>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 max-w-2xl text-[#d7e0e8]/85 leading-relaxed text-[15px]"
          >
            <span className="text-[#22ff9c]">$</span> cat ./bio.txt
            <br />
            <span className="text-[#8a96a3]">{profile.bio}</span>
          </motion.p>

          <div className="mt-6 flex items-center gap-2">
            {profile.socials.map((s) => {
              const Icon = icons[s.label] ?? Flag;
              return (
                <a
                  key={s.label}
                  href={s.url}
                  className="group flex items-center gap-2 px-3 py-2 border border-[#1a222d] rounded-sm hover:border-[#22ff9c]/60 hover:text-[#22ff9c] transition-colors text-xs uppercase tracking-widest text-[#8a96a3]"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* stats */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-3">
          {statItems.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="relative group overflow-hidden bg-[#0b0f14] border border-[#1a222d] rounded-md p-4 hover:border-[#22ff9c]/40 transition-colors"
              >
                <Icon className="w-4 h-4 mb-3" style={{ color: s.color }} />
                <div
                  className="font-mono text-3xl font-bold"
                  style={{ color: s.color, textShadow: `0 0 14px ${s.color}55` }}
                >
                  {s.value}
                </div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-[#8a96a3] mt-1">
                  {s.label}
                </div>
                <div
                  className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-10 blur-2xl"
                  style={{ backgroundColor: s.color }}
                />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* category breakdown */}
      {cats.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 font-mono">
            <div className="text-[11px] tracking-[0.25em] uppercase text-[#b061ff] mb-1">
              // breakdown
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="text-[#22ff9c]">$</span> ./stats --by category
            </h2>
            <p className="text-[#8a96a3] text-sm mt-2">
              Categories tackled across recorded CTFs.
            </p>
          </div>

          <div className="bg-[#0b0f14] border border-[#1a222d] rounded-md p-6">
            <div className="flex flex-wrap gap-3 mb-6">
              {cats.map(([name, count]) => (
                <CategoryBadge key={name} name={name} count={count} size="md" />
              ))}
            </div>

            <div className="font-mono text-[12px] space-y-1.5 mt-6 pt-6 border-t border-[#1a222d]">
              {cats.map(([name, count]) => {
                const ratio = count / maxCount;
                const width = Math.round(ratio * 40);
                return (
                  <div key={name} className="flex items-center gap-3">
                    <span className="w-20 text-[#8a96a3] uppercase">{name}</span>
                    <span className="text-[#22ff9c]">
                      {'█'.repeat(width)}
                      <span className="text-[#1a222d]">{'░'.repeat(40 - width)}</span>
                    </span>
                    <span className="text-[#d7e0e8] w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* recent activity */}
      <section className="mt-16">
        <div className="mb-6 font-mono">
          <div className="text-[11px] tracking-[0.25em] uppercase text-[#22ff9c] mb-1">
            // recent activity
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold">
            <span className="text-[#b061ff]">$</span> tail -n 5 ./ctf.log
          </h2>
        </div>

        <div className="bg-[#0b0f14] border border-[#1a222d] rounded-md overflow-hidden font-mono text-[12px]">
          {ctfs
            .slice()
            .sort((a, b) => +new Date(b.date) - +new Date(a.date))
            .slice(0, 5)
            .map((c, i) => (
              <div
                key={c.id}
                className={`flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 ${
                  i % 2 === 0 ? 'bg-[#07090c]/40' : ''
                } border-b border-[#1a222d] last:border-b-0`}
              >
                <span className="text-[#4d5966] w-24 shrink-0">
                  {new Date(c.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit',
                  })}
                </span>
                <span className="text-[#d7e0e8] flex-1 min-w-0 truncate">{c.name}</span>
                <span className="text-[#b061ff] text-[11px] uppercase">
                  {c.team ?? 'solo'}
                </span>
                {c.teamRank && (
                  <span className="text-[#22ff9c]">#{c.teamRank}</span>
                )}
                {!c.teamRank && c.individualRank && (
                  <span className="text-[#b061ff]">#{c.individualRank}</span>
                )}
              </div>
            ))}
        </div>
      </section>
    </PageTransition>
  );
}
