import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-10 mb-3 font-mono text-xl sm:text-2xl font-bold text-[#d7e0e8]">
      <span className="text-[#22ff9c] mr-2">//</span>{children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 font-mono text-lg font-bold text-[#b061ff]">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-[15px] leading-relaxed text-[#d7e0e8]/85 mb-4">{children}</p>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-5 border-l-2 border-[#b061ff] pl-4 py-1 italic text-[#8a96a3] bg-[#b061ff]/5">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="my-5 font-mono text-[13px] bg-[#07090c] border border-[#1a222d] rounded-sm p-4 overflow-x-auto text-[#22ff9c]">
      {children}
    </pre>
  ),
  code: ({ children, className }) => (
    <code className={className ?? 'font-mono text-[13px] text-[#22ff9c] bg-[#07090c] px-1 rounded'}>
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full font-mono text-sm border-collapse border border-[#1a222d]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-[#1a222d] px-3 py-2 text-left text-[#22ff9c] bg-[#0b0f14]">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-[#1a222d] px-3 py-2 text-[#d7e0e8]/85">{children}</td>
  ),
  img: ({ src, alt }) => {
    const base = import.meta.env.BASE_URL; // → '/home/' en prod, '/' en dev
    const resolved = src?.startsWith('/')
      ? `${base.replace(/\/$/, '')}${src}`   // /assets/img/x → /home/assets/img/x
      : `${base}assets/img/${src}`;          // x.jpg → /home/assets/img/x.jpg
    return (
      <img
        src={resolved}
        alt={alt ?? ''}
        className="rounded-md border border-[#1a222d] my-6 max-w-full"
      />
    );
  },
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="text-[#22ff9c] hover:underline underline-offset-2">
      {children}
    </a>
  ),
  hr: () => <hr className="my-8 border-[#1a222d]" />,
  ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-[#d7e0e8]/85 space-y-1">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-[#d7e0e8]/85 space-y-1">{children}</ol>,
  li: ({ children }) => <li className="text-[15px] leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="text-[#d7e0e8] font-bold">{children}</strong>,
};

export default function PostContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
}