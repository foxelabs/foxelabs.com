import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { allowRequest } from '../../lib/rateLimit';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const esc = (s: string) =>
  s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!allowRequest(`contact:${clientAddress}`)) {
    return json(429, { ok: false, error: 'Too many requests' });
  }

  const apiKey = import.meta.env.RESEND_API_KEY ?? process.env.RESEND_API_KEY;
  const to = import.meta.env.CONTACT_TO ?? process.env.CONTACT_TO ?? 'support@foxelabs.com';
  const from =
    import.meta.env.CONTACT_FROM ??
    process.env.CONTACT_FROM ??
    'Foxe Labs <support@foxelabs.com>';
  const isDev = import.meta.env.DEV;

  if (!apiKey) {
    console.error('[contact] missing RESEND_API_KEY');
    return json(500, { ok: false, error: 'Server not configured' });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
  // Optional — only present when the sender already owns a licence.
  const license = typeof body.license === 'string' ? body.license.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  // Honeypot: real users leave this empty.
  const trap = typeof body.company === 'string' ? body.company.trim() : '';

  if (trap) return json(200, { ok: true });
  if (!name || name.length > 120) return json(400, { ok: false, error: 'Invalid name' });
  if (!EMAIL_RE.test(email)) return json(400, { ok: false, error: 'Invalid email' });
  if (!subject || subject.length > 150)
    return json(400, { ok: false, error: 'Invalid subject' });
  if (license.length > 120) return json(400, { ok: false, error: 'Invalid license key' });
  if (!message || message.length > 5000)
    return json(400, { ok: false, error: 'Invalid message' });

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `[Contact] ${subject} — ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        license ? `License key: ${license}` : null,
        '',
        message,
      ]
        .filter((line) => line !== null)
        .join('\n'),
      html: `<p><strong>Name:</strong> ${esc(name)}</p>
<p><strong>Email:</strong> ${esc(email)}</p>
<p><strong>Subject:</strong> ${esc(subject)}</p>
${license ? `<p><strong>License key:</strong> ${esc(license)}</p>` : ''}
<p style="white-space:pre-wrap">${esc(message)}</p>`,
    });

    if (error) {
      console.error('[contact] resend error:', error);
      return json(502, {
        ok: false,
        error: isDev ? `${error.name}: ${error.message}` : 'Could not send message',
      });
    }

    console.log('[contact] sent', data?.id);
    return json(200, { ok: true });
  } catch (e) {
    console.error('[contact] exception:', e);
    return json(502, { ok: false, error: isDev ? String(e) : 'Could not send message' });
  }
};
