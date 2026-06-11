import type { Problem, Solution } from './data';

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'in', 'on', 'to', 'for', 'with',
  'against', 'about', 'is', 'are', 'what', 'who', 'how', 'why', 'do', 'does',
  'can', 'i', 'we', 'my', 'our',
]);

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s)
    .split(' ')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** Light stemmer so "harassment" matches "harass", "penalties" ~ "penalty", etc. */
function stem(t: string): string {
  return t
    .replace(/(ies)$/, 'y')
    .replace(/(ment|ments|tion|tions|ness|ing|ed|es|s)$/, '');
}

function overlap(queryTokens: string[], text: string): number {
  const textStems = new Set(tokens(text).map(stem));
  let hits = 0;
  for (const qt of queryTokens) {
    if (textStems.has(stem(qt))) hits++;
  }
  return hits;
}

export interface ProblemMatch {
  problem: Problem;
  score: number;
}

export function scoreProblems(query: string, problems: Problem[]): ProblemMatch[] {
  const qNorm = normalize(query);
  const qTokens = tokens(query);
  if (!qNorm) return [];

  const results: ProblemMatch[] = [];
  for (const p of problems) {
    let score = 0;
    const names = [p.name, ...p.aliases];

    // Whole-phrase match on name or alias
    if (names.some((n) => normalize(n) === qNorm)) score += 6;
    // Query contains a full name/alias or vice versa
    else if (
      names.some((n) => {
        const nn = normalize(n);
        return nn.length > 3 && (qNorm.includes(nn) || nn.includes(qNorm));
      })
    )
      score += 4;

    // Token overlap with names/aliases
    score += 2 * overlap(qTokens, names.join(' '));
    // Token overlap with tags
    score += 1.5 * overlap(qTokens, p.tags.join(' '));
    // Token overlap with framing text
    score += 1 * overlap(qTokens, p.framing);

    if (score > 0) results.push({ problem: p, score });
  }
  return results.sort((a, b) => b.score - a.score);
}

export interface Candidate {
  solution: Solution;
  matchedProblem: Problem;
  weight: number;
}

export function findCandidates(
  query: string,
  problems: Problem[],
  solutions: Solution[]
): Candidate[] {
  const allMatches = scoreProblems(query, problems);
  if (allMatches.length === 0) return [];

  // Keep only problems scoring close to the best match, so a common word
  // like "women" doesn't pull in every loosely related problem.
  const top = allMatches[0].score;
  const matches = allMatches.filter((m) => m.score >= top * 0.55);

  const bySlug = new Map(matches.map((m) => [m.problem.slug, m]));
  const candidates: Candidate[] = [];
  for (const s of solutions) {
    if (!s.active) continue;
    let best: ProblemMatch | undefined;
    for (const slug of s.relatedProblems) {
      const m = bySlug.get(slug);
      if (m && (!best || m.score > best.score)) best = m;
    }
    if (best) candidates.push({ solution: s, matchedProblem: best.problem, weight: best.score });
  }
  return candidates;
}

/** Weighted random pick, excluding already-seen solution ids. */
export function pickOne(candidates: Candidate[], seen: Set<string>): Candidate | null {
  const fresh = candidates.filter((c) => !seen.has(c.solution.id));
  if (fresh.length === 0) return null;
  const total = fresh.reduce((sum, c) => sum + c.weight, 0);
  let r = Math.random() * total;
  for (const c of fresh) {
    r -= c.weight;
    if (r <= 0) return c;
  }
  return fresh[fresh.length - 1];
}
