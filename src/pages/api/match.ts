import type { APIRoute } from 'astro';
import { loadProblems, loadSolutions } from '../../lib/data';
import { findCandidates, pickOne } from '../../lib/match';

export const GET: APIRoute = async ({ url }) => {
  const q = (url.searchParams.get('q') || '').trim();
  const seen = new Set(
    (url.searchParams.get('seen') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );

  if (!q) {
    return json({ error: 'empty' }, 400);
  }

  const candidates = findCandidates(q, loadProblems(), loadSolutions());

  if (candidates.length === 0) {
    return json({ noMatch: true });
  }

  const pick = pickOne(candidates, seen);
  if (!pick) {
    return json({ exhausted: true, total: candidates.length });
  }

  const { solution, matchedProblem } = pick;
  return json({
    solution: {
      id: solution.id,
      name: solution.name,
      type: solution.type,
      url: solution.url,
      location: solution.location,
      description: solution.description,
    },
    matchedProblem: { slug: matchedProblem.slug, name: matchedProblem.name },
    total: candidates.length,
  });
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
