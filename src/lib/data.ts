import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export interface Problem {
  slug: string;
  name: string;
  aliases: string[];
  tags: string[];
  framing: string; // markdown body: your definition / thematic framing
}

export type SolutionType =
  | 'organization'
  | 'law'
  | 'proposed law'
  | 'art project'
  | 'campaign'
  | 'institution'
  | 'program'
  | 'event'
  | 'other';

export interface Solution {
  id: string;
  name: string;
  type: SolutionType;
  url: string;
  location: string;
  active: boolean;
  relatedProblems: string[]; // problem slugs
  description: string; // markdown body
}

const DATA_DIR = path.join(process.cwd(), 'data');
export const PROBLEMS_DIR = path.join(DATA_DIR, 'problems');
export const SOLUTIONS_DIR = path.join(DATA_DIR, 'solutions');

function readDir(dir: string): { base: string; raw: string }[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ base: f.replace(/\.md$/, ''), raw: fs.readFileSync(path.join(dir, f), 'utf8') }));
}

export function loadProblems(): Problem[] {
  return readDir(PROBLEMS_DIR).map(({ base, raw }) => {
    const { data, content } = matter(raw);
    return {
      slug: base,
      name: data.name ?? base,
      aliases: Array.isArray(data.aliases) ? data.aliases.map(String) : [],
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      framing: content.trim(),
    };
  });
}

export function loadSolutions(): Solution[] {
  return readDir(SOLUTIONS_DIR).map(({ base, raw }) => {
    const { data, content } = matter(raw);
    return {
      id: base,
      name: data.name ?? base,
      type: (data.type ?? 'other') as SolutionType,
      url: data.url ?? '',
      location: data.location ?? '',
      active: data.active !== false,
      relatedProblems: Array.isArray(data.relatedProblems) ? data.relatedProblems.map(String) : [],
      description: content.trim(),
    };
  });
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function writeProblem(p: Omit<Problem, 'slug'> & { slug?: string }): string {
  const slug = p.slug || slugify(p.name);
  const file = matter.stringify('\n' + (p.framing || '').trim() + '\n', {
    name: p.name,
    aliases: p.aliases,
    tags: p.tags,
  });
  fs.mkdirSync(PROBLEMS_DIR, { recursive: true });
  fs.writeFileSync(path.join(PROBLEMS_DIR, `${slug}.md`), file);
  return slug;
}

export function writeSolution(s: Omit<Solution, 'id'> & { id?: string }): string {
  const id = s.id || slugify(s.name);
  const file = matter.stringify('\n' + (s.description || '').trim() + '\n', {
    name: s.name,
    type: s.type,
    url: s.url,
    location: s.location,
    active: s.active,
    relatedProblems: s.relatedProblems,
  });
  fs.mkdirSync(SOLUTIONS_DIR, { recursive: true });
  fs.writeFileSync(path.join(SOLUTIONS_DIR, `${id}.md`), file);
  return id;
}

export function deleteEntry(kind: 'problem' | 'solution', id: string): boolean {
  const dir = kind === 'problem' ? PROBLEMS_DIR : SOLUTIONS_DIR;
  const safe = id.replace(/[^a-z0-9-]/g, '');
  const fp = path.join(dir, `${safe}.md`);
  if (fs.existsSync(fp)) {
    fs.unlinkSync(fp);
    return true;
  }
  return false;
}
