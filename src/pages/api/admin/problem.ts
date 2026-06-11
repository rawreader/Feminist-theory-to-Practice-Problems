import type { APIRoute } from 'astro';
import { isAuthed } from '../../../lib/auth';
import { writeProblem } from '../../../lib/data';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!isAuthed(cookies)) return new Response('Unauthorized', { status: 401 });
  const form = await request.formData();
  const name = String(form.get('name') || '').trim();
  if (!name) return redirect('/admin?error=problem-name');
  const split = (v: FormDataEntryValue | null) =>
    String(v || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  writeProblem({
    name,
    slug: String(form.get('slug') || '').trim() || undefined,
    aliases: split(form.get('aliases')),
    tags: split(form.get('tags')),
    framing: String(form.get('framing') || ''),
  });
  return redirect('/admin?saved=problem');
};
