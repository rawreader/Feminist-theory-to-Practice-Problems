import type { APIRoute } from 'astro';
import { isAuthed } from '../../../lib/auth';
import { deleteEntry } from '../../../lib/data';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  if (!isAuthed(cookies)) return new Response('Unauthorized', { status: 401 });
  const form = await request.formData();
  const kind = String(form.get('kind'));
  const id = String(form.get('id'));
  if (kind === 'problem' || kind === 'solution') deleteEntry(kind, id);
  return redirect('/admin?saved=deleted');
};
