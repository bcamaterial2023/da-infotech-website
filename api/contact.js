/* ==========================================================================
   POST /api/contact — the contact form's only backend.
   --------------------------------------------------------------------------
   A Vercel Serverless Function (Node.js runtime). Deliberately dependency
   free: it talks to Resend over plain HTTPS with the global fetch that Node
   18+ ships, so the repository stays a no-build, no-node_modules folder.

   Everything the browser sends is re-validated here. Client-side validation
   is a courtesy to the visitor; it is not a control, because anyone can POST
   to this URL directly.

   Configuration — Vercel → Project → Settings → Environment Variables:

     RESEND_API_KEY   required.  From https://resend.com  (Settings → API Keys)
     CONTACT_TO       optional.  Defaults to dainfotech7@gmail.com
     CONTACT_FROM     optional.  Defaults to Resend's shared sender, which can
                                 only deliver to the address that owns the
                                 Resend account. Once a domain is verified in
                                 Resend, set this to e.g.
                                 "DA Infotech <website@yourdomain.com>".

   With RESEND_API_KEY absent the endpoint answers 503 + code "not_configured"
   and the form tells the visitor to call or email instead. It never reports a
   send that did not happen.
   ========================================================================== */

'use strict';

var RESEND_ENDPOINT = 'https://api.resend.com/emails';

var TO_DEFAULT   = 'dainfotech7@gmail.com';
var FROM_DEFAULT = 'DA Infotech Website <onboarding@resend.dev>';

/* Field ceilings. Long enough for a real enquiry, short enough that the
   endpoint cannot be used to relay a payload. */
var LIMITS = {
  name:    120,
  email:   254,   /* RFC 5321 maximum */
  phone:    32,
  service: 120,
  message: 5000
};

/* Deliberately permissive: one @, no spaces, a dot in the domain. Anything
   stricter starts rejecting addresses that genuinely deliver. */
var EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/* --- Rate limit ------------------------------------------------------------
   Per-instance and in-memory: a serverless instance is recycled and there may
   be several at once, so this is spam friction rather than a hard control.
   The honeypot below is what stops most bots. */
var WINDOW_MS = 10 * 60 * 1000;
var MAX_HITS  = 5;
var hits = new Map();

function rateLimited(ip) {
  var now = Date.now();
  var seen = (hits.get(ip) || []).filter(function (t) { return now - t < WINDOW_MS; });

  /* Keep the map from growing without bound across a warm instance's life. */
  if (hits.size > 500) hits.clear();

  if (seen.length >= MAX_HITS) {
    hits.set(ip, seen);
    return true;
  }

  seen.push(now);
  hits.set(ip, seen);
  return false;
}

/* --- Helpers --------------------------------------------------------------- */

function clientIp(req) {
  var fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim();
  if (Array.isArray(fwd) && fwd.length) return String(fwd[0]).trim();
  return req.headers['x-real-ip'] || 'unknown';
}

function readBody(req) {
  /* Vercel parses application/json for us. A hand-rolled POST may arrive as a
     string, or as a Buffer when the content type is missing — and a Buffer is
     an object, so without the check below it would sail past as a body whose
     every field is undefined and come back as a confusing validation error. */
  var body = req.body;

  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    try { return JSON.parse(body.toString('utf8')); } catch (err) { return null; }
  }

  if (body && typeof body === 'object') return body;
  return null;
}

function str(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/* A newline in a value that reaches a header or a subject line is a header
   injection. Nothing here needs one, so they are stripped everywhere except
   the message body. */
function oneLine(value) {
  return str(value).replace(/[\r\n\t]+/g, ' ');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function send(res, status, payload) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(payload);
}

/* --- Handler --------------------------------------------------------------- */

module.exports = async function handler(req, res) {

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return send(res, 405, { ok: false, code: 'method_not_allowed',
                            error: 'Use POST.' });
  }

  var body = readBody(req);
  if (!body) {
    return send(res, 400, { ok: false, code: 'bad_request',
                            error: 'Could not read the submission.' });
  }

  /* Honeypot. The field is present in the markup, hidden from people and from
     screen readers, and left empty by every human. A bot fills it in. Answer
     200 so the bot records a success and does not retry with variations. */
  if (str(body.company)) {
    return send(res, 200, { ok: true });
  }

  var name    = oneLine(body.name);
  var email   = oneLine(body.email).toLowerCase();
  var phone   = oneLine(body.phone);
  var service = oneLine(body.service);
  var message = str(body.message);

  var errors = {};

  if (!name)                          errors.name = 'Please tell us your name.';
  else if (name.length > LIMITS.name) errors.name = 'That name is too long.';

  if (!email)                            errors.email = 'Please enter your email address.';
  else if (email.length > LIMITS.email)  errors.email = 'That email address is too long.';
  else if (!EMAIL_RE.test(email))        errors.email = 'That does not look like a valid email address.';

  if (phone.length > LIMITS.phone)       errors.phone = 'That phone number is too long.';

  if (!message)                              errors.message = 'Please tell us what you need.';
  else if (message.length < 10)              errors.message = 'Please add a little more detail.';
  else if (message.length > LIMITS.message)  errors.message = 'That message is too long.';

  if (service.length > LIMITS.service) service = service.slice(0, LIMITS.service);

  if (Object.keys(errors).length) {
    return send(res, 422, { ok: false, code: 'invalid', errors: errors,
                            error: 'Please check the highlighted fields.' });
  }

  /* After validation, deliberately. A person who mistypes their address four
     times should not be locked out before their message ever goes anywhere;
     what needs limiting is mail actually sent, and nothing below this line
     fails validation. */
  if (rateLimited(clientIp(req))) {
    return send(res, 429, { ok: false, code: 'rate_limited',
                            error: 'Too many messages from this connection. ' +
                                   'Please try again shortly, or call us.' });
  }

  var apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    /* Loud on the server, honest to the visitor. */
    console.error('[contact] RESEND_API_KEY is not set — enquiry not delivered.');
    return send(res, 503, { ok: false, code: 'not_configured',
                            error: 'The form is not connected yet.' });
  }

  var to   = process.env.CONTACT_TO   || TO_DEFAULT;
  var from = process.env.CONTACT_FROM || FROM_DEFAULT;

  var lines = [
    'Name:    ' + name,
    'Email:   ' + email,
    'Phone:   ' + (phone || '—'),
    'Service: ' + (service || '—'),
    '',
    'Message:',
    message
  ];

  var html =
    '<div style="font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6;color:#14161A">' +
      '<h2 style="margin:0 0 16px;font-size:18px">New website enquiry</h2>' +
      '<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">' +
        '<tr><td style="padding:2px 16px 2px 0;color:#565A63">Name</td><td><strong>' + escapeHtml(name) + '</strong></td></tr>' +
        '<tr><td style="padding:2px 16px 2px 0;color:#565A63">Email</td><td><a href="mailto:' + escapeHtml(email) + '">' + escapeHtml(email) + '</a></td></tr>' +
        '<tr><td style="padding:2px 16px 2px 0;color:#565A63">Phone</td><td>' + escapeHtml(phone || '—') + '</td></tr>' +
        '<tr><td style="padding:2px 16px 2px 0;color:#565A63">Service</td><td>' + escapeHtml(service || '—') + '</td></tr>' +
      '</table>' +
      '<p style="margin:20px 0 6px;color:#565A63">Message</p>' +
      '<div style="white-space:pre-wrap;padding:14px 16px;background:#F7F7F6;' +
           'border:1px solid #E7E8EB;border-radius:10px">' + escapeHtml(message) + '</div>' +
      '<p style="margin-top:24px;font-size:12px;color:#888D96">' +
        'Sent from the DA Infotech website contact form.</p>' +
    '</div>';

  try {
    var response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from,
        to: [to],
        reply_to: email,          /* replying in Gmail goes to the enquirer */
        subject: 'Website enquiry — ' + name + (service ? ' (' + service + ')' : ''),
        text: lines.join('\n'),
        html: html
      })
    });

    if (!response.ok) {
      /* Read the provider's reason into the log, never into the response —
         it can carry account detail the public has no business seeing. */
      var detail = await response.text().catch(function () { return ''; });
      console.error('[contact] Resend responded ' + response.status + ': ' + detail);
      return send(res, 502, { ok: false, code: 'send_failed',
                              error: 'We could not send your message just now.' });
    }

    return send(res, 200, { ok: true });

  } catch (err) {
    console.error('[contact] send threw:', err && err.message ? err.message : err);
    return send(res, 502, { ok: false, code: 'send_failed',
                            error: 'We could not send your message just now.' });
  }
};
