import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.RESEND_API_KEY ?? process.env.RESEND_API_KEY;
  const audienceId =
    import.meta.env.RESEND_AUDIENCE_ID ?? process.env.RESEND_AUDIENCE_ID;
  const isDev = import.meta.env.DEV;

  if (!apiKey || !audienceId) {
    console.error('[waitlist] missing env', {
      hasKey: !!apiKey,
      hasAudience: !!audienceId,
    });
    return json(500, { ok: false, error: 'Server not configured' });
  }

  let email: unknown;
  try {
    const body = await request.json();
    email = body?.email;
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' });
  }

  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return json(400, { ok: false, error: 'Invalid email' });
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.contacts.create({
      email,
      audienceId,
      unsubscribed: false,
    });

    if (error) {
      console.error('[waitlist] resend error:', error);
      const duplicate =
        error.name === 'validation_error' ||
        /already exists/i.test(error.message ?? '');
      if (duplicate) return json(200, { ok: true, duplicate: true });
      return json(502, {
        ok: false,
        error: isDev ? `${error.name}: ${error.message}` : 'Could not subscribe',
      });
    }

    console.log('[waitlist] subscribed', email, data?.id);
    return json(200, { ok: true });
  } catch (e) {
    console.error('[waitlist] exception:', e);
    return json(502, {
      ok: false,
      error: isDev ? String(e) : 'Could not subscribe',
    });
  }
};
