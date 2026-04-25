export type Post = {
  slug: string;
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
  content?: string;
};

const modules = import.meta.glob('../data/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const yamlBlock = match[1];
  const content = match[2].trim();
  const data: Record<string, unknown> = {};

  for (const line of yamlBlock.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    const val = line.slice(colonIdx + 1).trim();

    if (!key) continue;

    // tableau : [a, b, c]
    if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    }
    // nombre
    else if (/^\d+$/.test(val)) {
      data[key] = parseInt(val, 10);
    }
    // string avec ou sans guillemets
    else {
      data[key] = val.replace(/^['"]|['"]$/g, '');
    }
  }

  return { data, content };
}

export function getAllPosts(): Post[] {
  return Object.entries(modules)
    .map(([filepath, raw]) => {
      console.log('RAW TYPE:', typeof raw, '| LENGTH:', raw?.length, '| PREVIEW:', raw?.slice(0, 100));
      const { data, content } = parseFrontmatter(raw);
       console.log('CONTENT LENGTH:', content?.length);
      const slug = filepath.split('/').pop()!.replace('.md', '');
      return { slug, ...data, content } as Post;
    })
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export function getPostBySlug(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

