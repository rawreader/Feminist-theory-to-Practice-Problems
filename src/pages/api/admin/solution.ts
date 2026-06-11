import type { APIRoute } from 'astro';
import { isAuthed } from '../../../lib/auth';
import { writeSolution, type SolutionType } from '../../../lib/data';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!isAuthed(cookies)) return new Response('Unauthorized', { status: 401 });
  const form = await request.formData();
  const name = String(form.get('name') || '').trim();
  const url = String(form.get('url') || '').trim();
  const relatedProblems = form.getAll('relatedProblems').map(String).filter(Boolean);
  if (!name) return redirect('/admin?error=solution-name');
  if (relatedProblems.length === 0) return redirect('/admin?error=solution-problems');
  writeSolution({
    name,
    id: String(form.get('id') || '').trim() || undefined,
    type: String(form.get('type') || 'other') as SolutionType,
    url,
    location: String(form.get('location') || '').trim(),
    active: form.get('active') !== 'false',
    relatedProblems,
    description: String(form.get('description') || ''),
  });
  return redirect('/admin?saved=solution');
};
