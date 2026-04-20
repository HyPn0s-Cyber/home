type Props = { kicker?: string; title: string; hint?: string };

export default function SectionTitle({ kicker, title, hint }: Props) {
  return (
    <div className="mb-6 font-mono">
      {kicker && (
        <div className="text-[11px] tracking-[0.25em] uppercase text-[#22ff9c] mb-1">{kicker}</div>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold text-[#d7e0e8]">
        <span className="text-[#b061ff] mr-2">&gt;</span>
        {title}
        <span className="text-[#22ff9c] ml-1 cursor-blink" />
      </h2>
      {hint && <p className="text-[#8a96a3] text-sm mt-2">{hint}</p>}
    </div>
  );
}
