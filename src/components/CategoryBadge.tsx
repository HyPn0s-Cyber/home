type Props = { name: string; count: number; size?: 'sm' | 'md' };

const palette: Record<string, { text: string; bg: string; border: string }> = {
  web:       { text: '#22ff9c', bg: 'rgba(34,255,156,0.08)',  border: 'rgba(34,255,156,0.35)'  },
  pwn:       { text: '#ff5c7a', bg: 'rgba(255,92,122,0.08)',  border: 'rgba(255,92,122,0.35)'  },
  crypto:    { text: '#b061ff', bg: 'rgba(176,97,255,0.10)',  border: 'rgba(176,97,255,0.40)'  },
  reverse:   { text: '#ffb347', bg: 'rgba(255,179,71,0.08)',  border: 'rgba(255,179,71,0.35)'  },
  forensics: { text: '#56d1ff', bg: 'rgba(86,209,255,0.08)',  border: 'rgba(86,209,255,0.35)'  },
  osint:     { text: '#ffe066', bg: 'rgba(255,224,102,0.08)', border: 'rgba(255,224,102,0.35)' },
  misc:      { text: '#8a96a3', bg: 'rgba(138,150,163,0.08)', border: 'rgba(138,150,163,0.35)' },
  hardware:  { text: '#ff8dd8', bg: 'rgba(255,141,216,0.08)', border: 'rgba(255,141,216,0.35)' },
  mobile:    { text: '#7affcf', bg: 'rgba(122,255,207,0.08)', border: 'rgba(122,255,207,0.35)' },
};

export default function CategoryBadge({ name, count, size = 'sm' }: Props) {
  const key = name.toLowerCase();
  const c = palette[key] ?? palette.misc;
  const pad = size === 'md' ? 'px-2.5 py-1 text-[12px]' : 'px-2 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono ${pad} rounded-sm border transition-transform hover:-translate-y-0.5`}
      style={{ color: c.text, backgroundColor: c.bg, borderColor: c.border }}
    >
      <span className="opacity-70">#</span>
      <span className="uppercase tracking-wide">{name}</span>
      <span className="opacity-60">×</span>
      <span className="font-bold">{count}</span>
    </span>
  );
}
