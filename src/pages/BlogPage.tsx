import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Search, ArrowUpRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import SectionTitle from '../components/SectionTitle';
import LazyImage from '../components/LazyImage';
//import posts from '../data/posts.json';
import { getAllPosts,  type Post } from '../lib/posts';
import PostContent from '../components/PostContent';
const posts = getAllPosts();

export default function BlogPage() {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => s.add(t)));
    return Array.from(s);
  }, []);

  const filtered = useMemo(() => {
    return posts
      .filter((p) => (tag ? p.tags.includes(tag) : true))
      .filter((p) => query.trim() === '' ? true : (p.title + p.summary + p.tags.join(' ')).toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [query, tag]);

  return (
    <PageTransition>
      <SectionTitle kicker="// journal" title="writeups & notes" hint="Field notes on exploitation, reversing and OSINT. No fluff, just payloads." />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a96a3]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search title, summary or tag..."
            className="w-full bg-[#0b0f14] border border-[#1a222d] rounded-sm font-mono text-sm px-10 py-2.5 text-[#d7e0e8] placeholder:text-[#4d5966] focus:outline-none focus:border-[#22ff9c]/60 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 font-mono text-[11px]">
        <button
          onClick={() => setTag(null)}
          className={`px-3 py-1.5 rounded-sm border uppercase tracking-widest transition-all ${
            tag === null ? 'border-[#22ff9c]/60 text-[#22ff9c] bg-[#22ff9c]/5' : 'border-[#1a222d] text-[#8a96a3] hover:text-[#d7e0e8]'
          }`}
        >
          #all
        </button>
        {allTags.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t === tag ? null : t)}
            className={`px-3 py-1.5 rounded-sm border uppercase tracking-widest transition-all ${
              tag === t ? 'border-[#b061ff]/60 text-[#b061ff] bg-[#b061ff]/5' : 'border-[#1a222d] text-[#8a96a3] hover:text-[#d7e0e8]'
            }`}
          >
            #{t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
          <Link
            to={`/blog/${p.slug}`}
            className="group block bg-[#0b0f14] border border-[#1a222d] rounded-md overflow-hidden hover:border-[#22ff9c]/60 hover:shadow-[0_0_0_1px_rgba(34,255,156,0.4),0_0_24px_rgba(34,255,156,0.2)] transition-all"
          >
            <LazyImage src={p.cover} alt={p.title} aspect="16/9" />
            <div className="p-5">
              <div className="flex flex-wrap gap-1.5 mb-3">
                {p.tags.map((t) => (
                  <span key={t} className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm border border-[#b061ff]/30 text-[#b061ff] bg-[#b061ff]/5">
                    #{t}
                  </span>
                ))}
              </div>
              <h3 className="font-mono text-[15px] font-bold text-[#d7e0e8] group-hover:text-[#22ff9c] transition-colors leading-snug">
                {p.title}
                <ArrowUpRight className="inline-block w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 -translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </h3>
              <p className="mt-2 text-[13px] text-[#8a96a3] leading-relaxed line-clamp-3">
                {p.summary}
              </p>
              <div className="mt-4 pt-3 border-t border-[#1a222d] flex items-center justify-between font-mono text-[11px] text-[#8a96a3]">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(p.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {p.readingTime} min read
                </span>
              </div>
            </div>
          </Link>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 font-mono text-[#8a96a3]">
          <div className="text-[#ff5c7a] mb-2">[!] no posts match</div>
          <div className="text-sm">try removing a tag or changing the query.</div>
        </div>
      )}
    </PageTransition>
  );
}
