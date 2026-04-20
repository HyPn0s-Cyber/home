import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  ExternalLink,
  Zap,
  AlertCircle,
  RefreshCw,
  Radio,
  MapPin,
  Globe,
  Users,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import SectionTitle from '../components/SectionTitle';

// ---------- types ----------

type Event = {
  id: string;
  title: string;
  link: string;
  officialUrl?: string;
  logoUrl?: string;
  description: string;
  start: Date;
  finish?: Date;
  weight: number;
  format: string;
  restrictions?: string;
  location?: string;
  onsite: boolean;
  organizers: string[];
};

type SourceLabel = 'ctftime-rss' | 'ctftime-api' | 'local-cache';

// ---------- sources ----------

const CTFTIME_RSS = 'https://ctftime.org/event/list/upcoming/rss/';
const CTFTIME_API_BASE = 'https://ctftime.org/api/v1/events/';
const CTFTIME_HOST = 'https://ctftime.org';

// Public read-through proxies that add CORS headers.
// We try several in order, since these free services have rate limits.
const CORS_PROXIES = [
  (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  (u: string) => `https://cors.isomorphic-git.org/${u}`,
];

// ---------- helpers ----------

// CTFtime RSS uses compact ISO-like timestamps, always UTC: 20260419T120000
function parseCtfTimeDate(raw: string | null | undefined): Date | null {
  if (!raw) return null;
  const s = raw.trim();
  const m = s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/);
  if (m) {
    // Treat as UTC (CTFtime feed is UTC).
    return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
  }
  const d = new Date(s);
  return Number.isNaN(+d) ? null : d;
}

function fmtDuration(days: number, hours: number): string {
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  return parts.join(' ') || '—';
}

function durationBetween(a: Date, b: Date): string {
  const ms = Math.max(0, +b - +a);
  const totalH = Math.round(ms / 36e5);
  const days = Math.floor(totalH / 24);
  const hours = totalH % 24;
  return fmtDuration(days, hours);
}

// Remove every HTML tag + decode a few common entities.
function stripHtml(input: string): string {
  if (!input) return '';
  const withoutTags = input.replace(/<[^>]+>/g, ' ');
  const decoded = withoutTags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&mdash;/gi, '—')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)));
  return decoded.replace(/\s+/g, ' ').trim();
}

// ---------- parsers ----------

function parseRss(xml: string): Event[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('invalid xml');

  const items = Array.from(doc.querySelectorAll('item'));
  const text = (it: Element, tag: string) =>
    it.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';

  return items
    .map((it): Event | null => {
      const start = parseCtfTimeDate(text(it, 'start_date')) ??
        parseCtfTimeDate(text(it, 'pubDate'));
      if (!start) return null;
      const finish = parseCtfTimeDate(text(it, 'finish_date')) ?? undefined;

      const title = text(it, 'title');
      const link = text(it, 'link') || text(it, 'guid') || '#';
      const weight = parseFloat((text(it, 'weight') || '0').replace(',', '.')) || 0;
      const format = text(it, 'format_text') || 'Jeopardy';
      const restrictions = text(it, 'restrictions') || undefined;
      const location = text(it, 'location') || undefined;
      const onsite = text(it, 'onsite').toLowerCase() === 'true';
      const url = text(it, 'url') || undefined;
      const logoRaw = text(it, 'logo_url');
      const logoUrl = logoRaw
        ? logoRaw.startsWith('http') ? logoRaw : `${CTFTIME_HOST}${logoRaw}`
        : undefined;

      let organizers: string[] = [];
      const orgRaw = text(it, 'organizers');
      if (orgRaw) {
        try {
          // Feed encodes single quotes — normalize to valid JSON first.
          const normalized = orgRaw.replace(/'/g, '"');
          const parsed = JSON.parse(normalized);
          if (Array.isArray(parsed)) {
            organizers = parsed
              .map((o) => (typeof o === 'object' && o ? o.name : null))
              .filter((x): x is string => !!x);
          }
        } catch {
          /* ignore */
        }
      }

      // The <description> is HTML-encoded markup — strip to a short summary.
      const desc = stripHtml(text(it, 'description'));

      return {
        id: link,
        title,
        link,
        officialUrl: url,
        logoUrl,
        description: desc,
        start,
        finish,
        weight,
        format,
        restrictions,
        location,
        onsite,
        organizers,
      };
    })
    .filter((e): e is Event => !!e);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseApi(json: any[]): Event[] {
  return json
    .map((e): Event | null => {
      const start = new Date(e.start);
      if (Number.isNaN(+start)) return null;
      return {
        id: String(e.id ?? e.ctftime_url ?? e.title),
        title: e.title ?? 'untitled',
        link: e.ctftime_url ?? e.url ?? '#',
        officialUrl: e.url ?? undefined,
        logoUrl: e.logo ?? undefined,
        description: stripHtml(e.description ?? '').slice(0, 420),
        start,
        finish: e.finish ? new Date(e.finish) : undefined,
        weight: typeof e.weight === 'number' ? e.weight : parseFloat(e.weight ?? '0') || 0,
        format: e.format ?? 'Jeopardy',
        restrictions: e.restrictions ?? undefined,
        location: e.location ?? undefined,
        onsite: !!e.onsite,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        organizers: (e.organizers ?? []).map((o: any) => o?.name).filter(Boolean),
      };
    })
    .filter((e): e is Event => !!e);
}

// ---------- fetchers ----------

async function fetchWithProxies(url: string, asJson: boolean): Promise<string> {
  const attempts = [url, ...CORS_PROXIES.map((p) => p(url))];
  let lastErr: unknown;
  for (const u of attempts) {
    try {
      const res = await fetch(u, {
        headers: asJson ? { accept: 'application/json' } : { accept: 'application/xml,text/xml,*/*' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const txt = await res.text();
      if (!txt || txt.length < 40) throw new Error('empty response');
      return txt;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error('all proxies failed');
}

async function fetchFromRss(): Promise<Event[]> {
  const xml = await fetchWithProxies(CTFTIME_RSS, false);
  const events = parseRss(xml);
  if (events.length === 0) throw new Error('rss: 0 items parsed');
  return events;
}

async function fetchFromApi(): Promise<Event[]> {
  const now = Math.floor(Date.now() / 1000);
  const url = `${CTFTIME_API_BASE}?limit=30&start=${now}&finish=${now + 60 * 60 * 24 * 120}`;
  const txt = await fetchWithProxies(url, true);
  const data = JSON.parse(txt);
  if (!Array.isArray(data)) throw new Error('api: not an array');
  const events = parseApi(data);
  if (events.length === 0) throw new Error('api: 0 items');
  return events;
}

async function fetchFromLocal(): Promise<Event[]> {
  const res = await fetch('/ctftime-rss.xml');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseRss(await res.text());
}

// ---------- live countdown hook ----------

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Countdown({ target, now }: { target: Date; now: number }) {
  const diff = +target - now;

  if (diff <= 0) {
    return (
      <span className="font-mono text-[11px] px-2 py-1 rounded-sm border border-[#ff5c7a]/50 text-[#ff5c7a] bg-[#ff5c7a]/5 shrink-0 uppercase tracking-widest flicker">
        • live now
      </span>
    );
  }

  const totalS = Math.floor(diff / 1000);
  const days = Math.floor(totalS / 86400);
  const hours = Math.floor((totalS % 86400) / 3600);
  const minutes = Math.floor((totalS % 3600) / 60);
  const seconds = totalS % 60;
  const pad = (n: number) => String(n).padStart(2, '0');

  const imminent = diff < 24 * 3600 * 1000;

  return (
    <span
      className={`font-mono text-[11px] px-2.5 py-1 rounded-sm border shrink-0 inline-flex items-center gap-1.5 ${
        imminent
          ? 'border-[#ffe066]/50 text-[#ffe066] bg-[#ffe066]/5'
          : 'border-[#22ff9c]/40 text-[#22ff9c] bg-[#22ff9c]/5'
      }`}
      title={target.toLocaleString()}
    >
      <Clock className="w-3 h-3" />
      {days > 0 && <span>{days}d</span>}
      <span className="tabular-nums">
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    </span>
  );
}

// ---------- component ----------

export default function UpcomingPage() {
  const [events, setEvents] = useState<Event[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [source, setSource] = useState<SourceLabel | null>(null);
  const [loading, setLoading] = useState(false);
  const now = useNow(1000);

  async function load() {
    setLoading(true);
    setErr(null);
    const sources: Array<[SourceLabel, () => Promise<Event[]>]> = [
      ['ctftime-rss', fetchFromRss],
      ['ctftime-api', fetchFromApi],
      ['local-cache', fetchFromLocal],
    ];
    const errors: string[] = [];
    for (const [label, fn] of sources) {
      try {
        const data = await fn();
        const sorted = data
          .filter((e) => !Number.isNaN(+e.start))
          // keep upcoming + currently running
          .filter((e) => !e.finish || +e.finish > Date.now())
          .sort((a, b) => +a.start - +b.start)
          .slice(0, 10);
        setEvents(sorted);
        setSource(label);
        setLoading(false);
        return;
      } catch (e) {
        errors.push(`${label}: ${(e as Error).message}`);
      }
    }
    setErr(errors.join('  |  '));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sourceLabel: Record<SourceLabel, string> = {
    'ctftime-rss': 'ctftime.org RSS feed (live)',
    'ctftime-api': 'ctftime.org JSON API (live)',
    'local-cache': '/ctftime-rss.xml (cached fallback)',
  };

  const tz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'local';
    }
  }, []);

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [],
  );

  return (
    <PageTransition>
      <SectionTitle
        kicker="// radar"
        title="upcoming ctfs"
        hint={`Next 10 events from ctftime.org — all times converted to your local zone (${tz}).`}
      />

      {/* status bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
        <div className="flex items-center gap-2 text-[#8a96a3]">
          <Radio
            className={`w-3.5 h-3.5 ${
              source === 'local-cache' ? 'text-[#ffe066]' : 'text-[#22ff9c]'
            } ${loading ? 'animate-pulse' : ''}`}
          />
          <span>
            source:{' '}
            <span className={source === 'local-cache' ? 'text-[#ffe066]' : 'text-[#22ff9c]'}>
              {source ? sourceLabel[source] : loading ? 'connecting…' : 'offline'}
            </span>
          </span>
          {events && (
            <span className="text-[#4d5966]"> · {events.length} events</span>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#1a222d] text-[#8a96a3] hover:border-[#22ff9c]/50 hover:text-[#22ff9c] uppercase tracking-widest transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          refresh
        </button>
      </div>

      {err && !events && (
        <div className="border border-[#ff5c7a]/40 bg-[#ff5c7a]/5 rounded-md p-4 font-mono text-xs text-[#ff5c7a] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <div className="mb-1 uppercase tracking-widest">all feeds unreachable</div>
            <div className="text-[#ff5c7a]/80 break-all">{err}</div>
          </div>
        </div>
      )}

      {loading && !events && (
        <div className="font-mono text-[#8a96a3] animate-pulse">
          <span className="text-[#22ff9c]">$</span> curl {CTFTIME_RSS} ...
        </div>
      )}

      <ol className="relative border-l border-[#1a222d] ml-3">
        {events?.map((e, i) => {
          const isLive = +e.start <= now && e.finish && +e.finish > now;
          const duration = e.finish ? durationBetween(e.start, e.finish) : undefined;

          return (
            <motion.li
              key={e.id + i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.6) }}
              className="ml-6 mb-5 relative"
            >
              <span
                className={`absolute -left-[34px] top-3 w-3 h-3 rounded-full border-2 ${
                  isLive
                    ? 'bg-[#ff5c7a] border-[#ff5c7a] shadow-[0_0_12px_#ff5c7a] flicker'
                    : 'bg-[#22ff9c] border-[#22ff9c] shadow-[0_0_12px_#22ff9c]'
                }`}
              />
              <div className="bg-[#0b0f14] border border-[#1a222d] hover:border-[#22ff9c]/50 rounded-md p-4 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex gap-3">
                    {e.logoUrl && (
                      <img
                        src={e.logoUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={(ev) => ((ev.currentTarget.style.display = 'none'))}
                        className="w-10 h-10 rounded-md border border-[#1a222d] object-cover shrink-0 mt-0.5 bg-[#07090c]"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-mono text-base sm:text-lg font-bold text-[#d7e0e8] leading-tight">
                        <a
                          href={e.link}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-[#22ff9c] inline-flex items-center gap-2"
                        >
                          {e.title}
                          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </a>
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 font-mono text-[11px] text-[#8a96a3]">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[#d7e0e8]">{dateFmt.format(e.start)}</span>
                        </span>
                        {duration && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {duration}
                          </span>
                        )}
                        <span className="uppercase tracking-widest text-[#b061ff]">{e.format}</span>
                        {e.weight > 0 && (
                          <span className="inline-flex items-center gap-1 text-[#ffe066]">
                            <Zap className="w-3 h-3" /> w={e.weight.toFixed(2)}
                          </span>
                        )}
                        {e.onsite ? (
                          <span className="inline-flex items-center gap-1 text-[#ff8dd8]">
                            <MapPin className="w-3 h-3" />
                            on-site{e.location ? ` · ${e.location}` : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#56d1ff]">
                            <Globe className="w-3 h-3" />
                            online
                          </span>
                        )}
                        {e.restrictions && (
                          <span className="uppercase tracking-widest text-[#4d5966]">
                            {e.restrictions}
                          </span>
                        )}
                        {e.organizers.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[#8a96a3] truncate max-w-[240px]">
                            <Users className="w-3 h-3" />
                            {e.organizers.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Countdown target={e.start} now={now} />
                </div>
                {e.description && (
                  <p className="text-sm text-[#8a96a3] mt-3 leading-relaxed line-clamp-2">
                    {e.description}
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>

      {events && events.length === 0 && (
        <div className="text-center py-20 font-mono text-[#8a96a3]">
          <div className="text-[#ffe066] mb-2">[~] no upcoming events in the feed</div>
          <div className="text-sm">check back soon.</div>
        </div>
      )}
    </PageTransition>
  );
}
