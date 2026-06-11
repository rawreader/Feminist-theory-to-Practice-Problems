import type { APIRoute } from 'astro';
import { checkPassword, setSession } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const pw = String(form.get('password') || '');
  if (checkPassword(pw)) {
    setSession(cookies);
    return redirect('/admin');
  }
  return redirect('/admin?error=1');
};
