# DA Infotech — Website

Marketing site for **DA Infotech**, a technology studio in Porbandar, Gujarat.

One HTML file, one stylesheet, one small inline script, and one serverless function for
the contact form. No framework, no build step, no package manager, no dependencies — the
folder ships as-is to Vercel.

---

## Company

| | |
|---|---|
| **Address** | First Floor, Nebhani Seri, Kadachh, Porbandar, Gujarat – 362230, India |
| **Phone** | +91-91043-77310 |
| **Email** | dainfotech7@gmail.com |
| **Live** | https://da-infotech-website.vercel.app/ |

**Services** — Website development · Website management · Responsive design · Performance
optimisation · Mobile apps · AI & automation · SEO · Google Search Console · Google
Analytics · Website security & firewall · Domain & hosting · Backup & maintenance · Career,
resume and document services

**Client sites**
- https://porbandarchalkpowder.com/
- https://hl3rubber.com/
- http://gayatrirubberchemicals.com/

---

## Structure

```
.
├── index.html            # the entire page — markup + one inline <script>
├── api/
│   └── contact.js        # Vercel Serverless Function — the contact form's backend
├── css/
│   └── main.css          # the whole design system
├── assets/
│   ├── icons/            # favicon.svg
│   └── images/           # 9 client-site captures + og-cover.jpg (358 KB total)
├── vercel.json           # security headers
├── .env.example          # what to set in Vercel, and why
├── robots.txt
└── sitemap.xml
```

Every icon on the page is inline SVG in `index.html`, stroked with `currentColor` so it
picks up whatever the surrounding section sets. Photographic imagery is confined to
`assets/images/` — real captures of the client sites, nothing stock.

---

## Page order

Hero → About → Services → Digital Solutions → Work → **Client Reviews** →
Career & Resume Solutions → More Services → Why Choose Us → Process → Contact → Footer.

Two rules hold this together and are easy to break by accident:

**No degree names, no student framing, anywhere public.** The About section carries a
generic *Academic Background* paragraph and nothing more specific. The services that
students buy are still sold — project support, documentation, portfolio and resume work —
but under professional language, in *Career & Resume Solutions*. Read the comment above
that section before editing it.

**Bands alternate white / `--bg-subtle`.** Reviews is `band--paper-deep` and sits between
Work (white) and Career (white), so the alternation holds with it switched on. If it is
ever switched back off, the marquee strip before it is what stops the two white bands
either side from reading as a mistake — leave that strip alone.

---

## Running it

No build. Open `index.html`, or serve the folder if you want correct relative paths:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`. The contact form will report that it cannot reach the
server, which is correct — `/api/contact` only exists on Vercel. To exercise the function
locally, `npx vercel dev` instead.

---

## The contact form

`index.html` POSTs JSON to `/api/contact`. That function re-validates every field, then
sends through **Resend**'s REST API using the global `fetch` in Node 18+ — no npm package,
so the repository stays dependency free.

### Configuration

Vercel → Project → Settings → Environment Variables. See `.env.example`.

| Variable | Required | Default |
|---|---|---|
| `RESEND_API_KEY` | **yes** | — |
| `CONTACT_TO` | no | `dainfotech7@gmail.com` |
| `CONTACT_FROM` | no | `DA Infotech Website <onboarding@resend.dev>` |

Resend's shared sender only delivers to the address that owns the Resend account — so sign
up with **dainfotech7@gmail.com** and it works immediately. Once a domain is verified in
Resend, set `CONTACT_FROM` to an address on it and mail to anywhere is possible.

With `RESEND_API_KEY` unset the endpoint answers `503 not_configured` and the form tells
the visitor to call or email instead. **It never reports a send that did not happen** —
that failure mode is the whole reason the endpoint exists.

### What protects it

- Every rule the browser checks is checked again on the server; the client-side pass is a
  courtesy, not a control.
- A honeypot field (`company`) hidden off-screen, `aria-hidden`, `tabindex="-1"`. Filled in
  → the server answers `200` so the bot records success and stops varying its payload.
- Five submissions per IP per ten minutes. In-memory and per-instance, so it is friction
  rather than a hard limit — the honeypot does the real work.
- Every value is HTML-escaped into the email body, and newlines are stripped from anything
  that reaches the subject line.
- The provider's error text goes to the log, never to the response.

### Testing it

1. Deploy, set `RESEND_API_KEY`, then submit the form and check dainfotech7@gmail.com.
   Replying to that mail goes back to the enquirer — `reply_to` is set to their address.
2. Failure paths, without a browser:
   ```bash
   curl -i https://YOUR-SITE/api/contact                     # 405
   curl -i -X POST https://YOUR-SITE/api/contact \
        -H 'Content-Type: application/json' -d '{}'          # 422 + per-field errors
   curl -i -X POST https://YOUR-SITE/api/contact \
        -H 'Content-Type: application/json' \
        -d '{"name":"A","email":"a@b.co","message":"A real enquiry, long enough.","company":"bot"}'
                                                             # 200, silently discarded
   ```
3. Six valid posts in a row from one IP: the sixth returns `429`.

---

## Design system

Everything lives in `css/main.css`, which is ordered as a table of contents — tokens first,
then reset, type, layout, primitives, and one numbered section per page section.

### Colour

The palette is deliberately narrow: a neutral ground, one accent, and one warm secondary
used sparingly. Adding a fourth hue is how this turns back into a paint chart.

| Token | Value | Use |
|---|---|---|
| `--bg` / `--bg-subtle` | `#FFFFFF` / `#F7F7F6` | page ground, alternating bands |
| `--bg-dark` | `#101318` | contact, footer, the resume CTA |
| `--text` / `--text-2` / `--text-3` | `#14161A` / `#565A63` / `#6E737C` | primary, supporting, meta |
| `--border` | `#E7E8EB` | every hairline |
| `--accent` | `#2B45C4` | primary — links, fills, numerals |
| `--accent-soft` | `#EFF1FD` | tinted surfaces, icon wells |
| `--warm` / `--warm-light` | `#B9721E` / `#E9A44E` | required marks, career icon wells, stars |

Light panels placed on `.band--ink` must set their own `color`. The band sets a pale text
colour that otherwise inherits straight into the panel and makes labels — and anything the
visitor types — invisible. `.form` does this explicitly.

### Card treatments

Three, and no more. Adding a fourth is how a system becomes a scrapbook.

- `.svc` — icon over heading, lifts on hover. Things that get **built**.
- `.sol` — icon beside text, flat. Things that get **run**.
- `.card` — the work grid: a 16:10 visual over a body whose `.card__text` takes the slack,
  which is what keeps the foot rule and the action on one line across a whole row.

`.pack` (career) and `.rev` (reviews) are `.svc` with a different icon well and a list or a
quote in place of the paragraph.

### Typography

- **Plus Jakarta Sans** — display and headings
- **Inter** — body and UI

Sizes are `clamp()` pairs from `--fs-micro` to `--fs-display`; nothing hard-codes a px size.

The site is English-only. The Gujarati (`.guj`) and Devanagari (`.dev`) layers, and the two
Google fonts that served them, were removed — if they ever come back, they need real `lang`
attributes and their own letter-spacing, because `.label` tracking breaks Indic shaping.

### Spacing

Steps `--s-1` … `--s-9` for anything inside a component. Above `--s-6`, use one of the three
rhythm tokens instead, or the page drifts out of rhythm one section at a time:

- `--band` — section padding
- `--band-gap` — section head to its content
- `--block-gap` — between large repeated blocks

### Motion

Two durations. `--t` (180ms) for interaction — hover states lift by 1–4px and nothing else.
`--t-reveal` (720ms, near-expo ease-out) for entrances.

**Reveal on scroll.** Add `data-reveal` to an element and it fades and rises 22px into place
as it enters the viewport, once. Add `data-reveal-group` to a container and its revealing
descendants stagger 90ms apart, capped at 5 steps. Opacity and transform only — both
composited, so nothing here triggers layout.

The hidden state is scoped to `html.js`, a class set by an inline script in `<head>` before
first paint. **This is load-bearing:** the CSS holds `[data-reveal]` at `opacity: 0`, so if
that rule ever applied without the script running, the page would be blank. With scripting
off the class never lands and every element renders at its final state.

The observer is the mechanism, not the guarantee: a passive scroll listener sweeps anything
still hidden inside the viewport, and both listeners remove themselves once nothing is left.

`prefers-reduced-motion` pins reveals to their visible state, stops the tickers and the hero
drift, and collapses every transition.

### Breakpoints

`1024px` — every three-up grid steps to two, nav becomes a drawer. `720px` — grids go single
column and `.card` caps at 32rem. `480px` — small-phone floor: buttons go full width, the
footer stacks to one column.

Verified at 15 widths from **225px to 1887px**: `scrollWidth === clientWidth` at every one,
and no element's box extends past the viewport on either side.

### Colour and contrast

Every text/background pair on the page meets WCAG AA — measured, at three widths, over
every text node. Two tokens exist only because of it:

- `--text-3` is `#6E737C` (4.77:1 on white), not the `#888D96` it used to be. That was
  3.34:1, and it carries 11–13px text — stat labels, card meta, form hints.
- `--warm-ink` (`#96590F`, 5.6:1) is for amber that has to be **read**. `--warm` itself is
  3.83:1: fine for an icon well or a rule, under AA as text.

**`--text-3` is only safe on white, and its margin is thin.** It clears AA by 0.27 against
`#FFFFFF`. Move the same token onto a tinted panel and it fails: on `--accent-soft`
(`#EFF1FD`, the ground of `.hero__panel` and `.about__stamp`) it drops to **4.24:1**.
`.hero__origin` shipped that way and is now `--text-2` (6.15:1 on the same ground). Any
`--text-3` text that moves onto a tinted surface has to be re-measured against *that*
surface — a token verified against the page ground proves nothing about a panel sitting
on top of it.

### Six traps worth knowing

Several structural elements are `<span>`s — `.card__visual`, `.card__screen`. An inline box
ignores `aspect-ratio`, `height` and `overflow`, so both carry an explicit `display`.
Removing it collapses the element and its children escape the layout entirely.

`.head__title` and `.head__lead` carry a `flex-basis` (`26rem` / `30rem`) that is a **width**
only while `.head__row` is a row. The 720px query flips it to `flex-direction: column`, where
that same basis becomes a **height** — which forced every section head to 912px tall and put
a screen and a half of blank space between a heading and its own paragraph. The query resets
`flex: 0 1 auto` alongside the direction change. If you add a third child, reset it too.

**A percentage can be circular, and it fails silently.** `.about__stamp` is a grid whose
item carried `max-width: 100%`. That never clamped: an implicit `auto` track sizes itself to
the item's max-content and will not shrink below it, so `100%` resolved against the item's
own width. The fix is to give the track a floor with `grid-template-columns: minmax(0, 1fr)`.
`margin-inline: auto` sets the same trap: on a grid item it forces shrink-to-fit, making
every percentage inside it circular. Use `justify-self` to centre instead. The stylesheet
uses `minmax(0, 1fr)` rather than `1fr` throughout for exactly this reason.

**An HTML comment ends at the first `-->`.** The Client Reviews section is disabled by
commenting it out, so nothing inside that block may contain a comment closer — the browser
would end the comment early and render the placeholder quotes as live content.

**A full-card link overlay needs a z-index, and the bug is invisible.** `.card__title
a::after` covers the card so the whole thing is clickable. Everything inside
`.card__visual` is explicitly layered — placeholder 1, screenshot 2, phone notch 3 — and
`.card` is not a stacking context, so an overlay left at `auto` sits *under* all of it.
Nothing looks wrong; the image half of every work card just stops responding to clicks,
which is the half people aim at. It is `z-index: 4`, and hit-tested at three widths.

**`overflow-wrap: break-word` does not shrink min-content; `anywhere` does.** Both break a
word identically once the line box is too narrow — but a *shrink-to-fit* box is sized from
min-content first, so it grows to the longest word and pushes the page sideways before the
break rule is ever consulted. `.head__row` becomes `align-items: flex-start` below 720px,
which makes its children shrink-to-fit; "Straightforward" at 30px overflowed a 225px
viewport by 17px with `break-word` set. The heading rule uses `anywhere`.

---

## Script

There are two. A one-liner in `<head>` sets `html.js` before first paint — see **Motion**
above for why that has to come first. The one at the bottom of `index.html` does five things
and nothing else:

1. Mobile drawer — toggles `.is-open` on `[data-nav]`, closes on navigate and on Escape
2. Reveal on scroll — adds `.is-revealed` to `[data-reveal]`, with a scroll-listener backstop
3. Scroll spy — marks the current `.nav__link` with `.is-active`
4. Fills the footer year
5. Validates and submits the contact form, and reports what actually happened

The page is complete and legible with JavaScript off — except the form, which needs the
script to submit. Phone, email and WhatsApp are on the page beside it either way.

---

## Google services

Both are **placeholders, not integrations.** Nothing is sent to Google until you paste a
real ID and uncomment the block.

- **Analytics** — the GA4 snippet sits commented in `<head>`. Replace both occurrences of
  `G-XXXXXXXXXX` with the Measurement ID from Analytics → Admin → Data Streams.
- **Search Console** — the `google-site-verification` meta tag sits commented in `<head>`.
  Search Console → Add property → HTML tag gives you the content value. Then submit
  `sitemap.xml`.
- `vercel.json`'s Content-Security-Policy already allows `googletagmanager.com` and
  `google-analytics.com`, so enabling either does not need a policy change.

---

## Security

- `vercel.json` sets CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
  `Referrer-Policy` and `Permissions-Policy` on every response.
- The CSP still needs `'unsafe-inline'` for scripts, because both scripts are inline. It
  restricts *which origins* can serve script, which is real, but it is not XSS protection.
  Moving both scripts to files and dropping that keyword is the upgrade.
- No API key reaches the browser. `RESEND_API_KEY` is read by `api/contact.js` on the
  server; `.env` is gitignored and only `.env.example` is committed.
- Vercel serves HTTPS by default. HSTS is set with `preload`; remove that keyword if the
  domain is ever needed on plain HTTP.

---

## Known gaps

**The three app screenshots are still missing.** ChatApp, PDF Magic Studio and VedaMrita
show a drawn placeholder monogram, because they are Flutter apps with no URL to capture —
these have to be supplied by hand at **540×1140**. Four `SCREENSHOT SLOT` blocks remain in
`index.html`. The three *client* cards are done: real captures, each with the site's mobile
build in a phone overlay and a second page that cross-fades in on hover.

**Client Reviews is live and its contents are invented.** See the stop notice under
**Before launch**. This is the most serious thing outstanding in the repository.

**Client work is disclosed in full.** The three client sites are named, their domains shown,
linked outward, and their branding is on screen in nine screenshots. Earlier revisions
deliberately withheld all of this. It was re-enabled on request — if that decision is ever
reversed, the places to change are: the six work-card fields, the hero panel, the About
panel, `README.md`, and the Work section header.

**The technology list is unverified.** The names in the ticker came from the brief, not from
an audit of what the team actually uses. Prune it before launch.

**The stats are counts, not claims.** Three live sites, six projects, nine service areas,
twenty-plus services — all countable on this page. Nothing claims traffic, revenue or
results. Keep it that way unless you can evidence it.

**End-to-end mail delivery is untested.** The endpoint's validation, honeypot, rate limit
and request shape were exercised against a stubbed provider; no real message has been sent,
because that needs a live `RESEND_API_KEY`. Send one before you rely on the form.

---

## Before launch

> ### ⛔ STOP — the Client Reviews section currently contains INVENTED testimonials
>
> Three reviews are live on the page and **every word of them is fabricated**.
> Nilesh Vora, Meera Shah and Ashok Mehta do not exist. Nobody said any of it.
>
> They were written as sample copy so the layout could be judged, and they read
> as completely genuine — which is exactly why this warning is here and not in a
> code comment. Nothing in the build will catch this.
>
> **Do one of these before any deploy:**
> - Replace all three with real, permissioned quotes from real clients, and set
>   each star count to what that client actually said, or
> - Switch the section back off — re-comment the block in `index.html` plus the
>   Reviews links in the header nav and the footer Navigation column.
>
> Do not simply swap the invented names for real client names. Inventing praise
> and signing a real business to it is the part that creates a genuine problem.

- [ ] **Resolve the invented reviews above — replace with real quotes, or switch the section off**
- [ ] Create the Resend account, set `RESEND_API_KEY` in Vercel, send one real test enquiry
- [ ] Add the three app screenshots (540×1140), uncomment the remaining `SCREENSHOT SLOT` blocks
- [ ] Paste the GA4 Measurement ID and the Search Console verification token
- [ ] Submit `sitemap.xml` in Search Console
- [ ] Confirm or prune the technology list
- [ ] Check the three client links still resolve
- [ ] If a custom domain replaces the Vercel one, change the origin in `index.html`
      (canonical + Open Graph + JSON-LD), `sitemap.xml` and `robots.txt` in one commit
