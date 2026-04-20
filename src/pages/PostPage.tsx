import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Flag, User, Award, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import PageTransition from '../components/PageTransition';
import LazyImage from '../components/LazyImage';
import rawPosts from '../data/posts.json';

type Block =
  | { type: 'h2' | 'h3' | 'p' | 'quote' | 'code' | 'flag'; text: string }
  | { type: 'kv'; k: string; v: string };

type Post = {
  id: string;
  title: string;
  date: string;
  author?: string;
  event?: string;
  category?: string;
  summary: string;
  tags: string[];
  readingTime: number;
  cover: string;
  flag?: string;
  content?: Block[];
};

const posts = rawPosts as Post[];

function Flagline({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-6 font-mono text-sm flex items-center gap-3 bg-[#0b0f14] border border-[#22ff9c]/40 rounded-sm px-4 py-3 overflow-hidden">
      <Flag className="w-4 h-4 text-[#22ff9c] shrink-0" />
      <code className="text-[#22ff9c] glow-neon truncate flex-1">{value}</code>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        }}
        className="text-[#8a96a3] hover:text-[#22ff9c] transition-colors shrink-0"
        title="copy flag"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

function renderBlock(b: Block, i: number) {
  switch (b.type) {
    case 'h2':
      return (
        <h2 key={i} className="mt-10 mb-3 font-mono text-xl sm:text-2xl font-bold text-[#d7e0e8]">
          <span className="text-[#22ff9c] mr-2">//</span>
          {b.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={i} className="mt-6 mb-2 font-mono text-lg font-bold text-[#b061ff]">
          {b.text}
        </h3>
      );
    case 'p':
      return (
        <p key={i} className="text-[15px] leading-relaxed text-[#d7e0e8]/85 mb-4">
          {b.text}
        </p>
      );
    case 'quote':
      return (
        <blockquote
          key={i}
          className="my-5 border-l-2 border-[#b061ff] pl-4 py-1 italic text-[#8a96a3] bg-[#b061ff]/5"
        >
          {b.text}
        </blockquote>
      );
    case 'code':
      return (
        <pre
          key={i}
          className="my-5 font-mono text-[13px] bg-[#07090c] border border-[#1a222d] rounded-sm p-4 overflow-x-auto text-[#22ff9c]"
        >
          <code>{b.text}</code>
        </pre>
      );
    case 'kv':
      return (
        <div
          key={i}
          className="my-3 font-mono text-sm flex flex-wrap gap-2 bg-[#0b0f14] border border-[#1a222d] rounded-sm px-3 py-2"
        >
          <span className="text-[#8a96a3]">{b.k}</span>
          <span className="text-[#4d5966]">›</span>
          <span className="text-[#d7e0e8]">{b.v}</span>
        </div>
      );
    case 'flag':
      return <Flagline key={i} value={b.text} />;
    default:
      return null;
  }
}

export default function PostPage() {
  const { id } = useParams();
  const post = useMemo(() => posts.find((p) => p.id === id), [id]);

  if (!post) {
    return (
      <PageTransition>
        <div className="font-mono text-center py-20">
          <div className="text-[#ff5c7a] mb-3 text-lg">[!] 404 — post not found</div>
          <Link to="/blog" className="text-[#22ff9c] hover:underline text-sm">
            ← back to blog
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <article className="max-w-3xl mx-auto">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-[#8a96a3] hover:text-[#22ff9c] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          back to blog
        </Link>

        {/* tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm border border-[#b061ff]/30 text-[#b061ff] bg-[#b061ff]/5"
            >
              #{t}
            </span>
          ))}
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-3xl sm:text-4xl font-bold text-[#d7e0e8] leading-tight"
        >
          {post.title}
        </motion.h1>

        {/* meta */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-[#8a96a3] mb-6">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {post.author && (
            <span className="inline-flex items-center gap-1">
              <User className="w-3 h-3" /> {post.author}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> {post.readingTime} min read
          </span>
          {post.event && (
            <span className="inline-flex items-center gap-1 text-[#22ff9c]">
              <Award className="w-3 h-3" /> {post.event}
            </span>
          )}
          {post.category && (
            <span className="uppercase tracking-widest text-[#b061ff]">
              {post.category}
            </span>
          )}
        </div>

        {/* cover */}
        <LazyImage
          src={post.cover}
          alt={post.title}
          aspect="16/9"
          className="rounded-md border border-[#1a222d] mb-8"
        />

        <p className="text-[#8a96a3] leading-relaxed italic border-l-2 border-[#22ff9c] pl-4 mb-8">
          {post.summary}
        </p>

        {post.content?.map((b, i) => renderBlock(b, i))}

        {/* final flag if defined and not already in content */}
        {post.flag && !post.content?.some((b) => b.type === 'flag') && (
          <Flagline value={post.flag} />
        )}

        <footer className="mt-12 pt-6 border-t border-[#1a222d] flex items-center justify-between font-mono text-[11px] text-[#8a96a3]">
          <Link to="/blog" className="hover:text-[#22ff9c] transition-colors">
            ← more write-ups
          </Link>
          <span className="text-[#4d5966]">EOF</span>
        </footer>
      </article>
    </PageTransition>
  );
}
