import type { APIRoute } from 'astro';
import { loadProblems, loadSolutions } from '../lib/data';

// In local (server) mode this runs on every request, so admin edits show up
// immediately. In the static build it is rendered once into /catalog.json.
export const GET: APIRoute = () => {
  const body = JSON.stringify({
    problems: loadProblems(),
    solutions: loadSolutions().filter((s) => s.active),
  });
  return new Response(body, { headers: { 'Content-Type': 'application/json' } });
};
