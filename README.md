# DA Infotech — Website

Static marketing site for **DA Infotech**, a technology studio in Porbandar, Gujarat.

One HTML file, one stylesheet, one small inline script. No frameworks, no build step, no
package manager, no dependencies — the folder ships as-is to any static host.

---

## Company

| | |
|---|---|
| **Address** | First Floor, Nebhani Seri, Kadachh, Porbandar, Gujarat – 362230, India |
| **Phone** | +91-63537-57310 |
| **Email** | dainfotech7@gmail.com |

**Services** — Web & Software Development · Mobile App Development · AI & Automation · Digital Marketing

**Client sites**
- https://porbandarchalkpowder.com/
- https://hl3rubber.com/
- http://gayatrirubberchemicals.com/

---

## Structure

```
.
├── index.html            # the entire page — markup + one inline <script>
├── css/
│   └── main.css          # the whole design system
├── assets/
│   ├── icons/            # favicon.svg
│   ├── images/           # EMPTY — screenshot slots are waiting on these
│   └── models/           # EMPTY
├── robots.txt
└── sitemap.xml
```

Every icon on the page is inline SVG in `index.html`, stroked with `currentColor` so it
picks up whatever the surrounding section sets. There are no image assets yet.

---

## Running it

No build. Open `index.html`, or serve the folder if you want correct relative paths:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

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
| `--bg-dark` | `#101318` | contact and footer |
| `--text` / `--text-2` / `--text-3` | `#14161A` / `#565A63` / `#888D96` | primary, supporting, meta |
| `--border` | `#E7E8EB` | every hairline |
| `--accent` | `#2B45C4` | primary — links, fills, numerals |
| `--accent-soft` | `#EFF1FD` | tinted surfaces, icon wells |
| `--warm` / `--warm-light` | `#B9721E` / `#E9A44E` | required marks, the one warm accent |

Light panels placed on `.band--ink` must set their own `color`. The band sets a pale text
colour that otherwise inherits straight into the panel and makes labels — and anything the
visitor types — invisible. `.form` does this explicitly.

### Typography

- **Plus Jakarta Sans** — display and headings
- **Inter** — body and UI
- **Hind Vadodara** — the Gujarati lines (`.guj`)
- **Hind** — the Devanagari lines (`.dev`)

Sizes are `clamp()` pairs from `--fs-micro` to `--fs-display`; nothing hard-codes a px size.

### Spacing

Steps `--s-1` … `--s-9` for anything inside a component. Above `--s-6`, use one of the three
rhythm tokens instead, or the page drifts out of rhythm one section at a time:

- `--band` — section padding
- `--band-gap` — section head to its content
- `--block-gap` — between large repeated blocks

### Motion

One duration (`--t`, 180ms) and one easing. Hover states lift by 1–4px and nothing else.
`prefers-reduced-motion` collapses every animation and stops the tickers.

### A trap worth knowing

Several structural elements are `<span>`s — `.proj__shot`, `.study__screen`. An inline box
ignores `aspect-ratio`, `height` and `overflow`, so both carry an explicit `display: block`.
Removing it collapses the element to 0×0 and its children escape the layout entirely.

---

## Script

The inline `<script>` at the bottom of `index.html` does three things and nothing else:

1. Mobile drawer — toggles `.is-open` on `[data-nav]`, closes on navigate and on Escape
2. Scroll spy — marks the current `.nav__link` with `.is-active`
3. Fills the footer year, and intercepts the contact form

The page is complete and legible with JavaScript off.

---

## Known gaps

**The contact form does not send anything.** It has no handler and no backend. On submit it
cancels the event and says so on screen. Wire it to Formspree, Netlify Forms, Basin or your
own endpoint before launch — and add server-side validation when you do.

**Project screenshots are missing.** `assets/images/` is empty, so the work and student
cards show a placeholder wordmark on a tinted panel. The markup for the real images is
already written and commented out — search `SCREENSHOT SLOT` in `index.html`. Supply:

- client sites — 1600×1000 and 800×500
- student apps — 540×1140

**The technology list is unverified.** The names in the ticker came from the brief, not from
an audit of what the team actually uses. Prune it before launch.

**The stats are counts, not claims.** Three live sites, three student apps, four service
lines, four student streams. Nothing on the page claims traffic, revenue or results — keep
it that way unless you can evidence it.

---

## Before launch

- [ ] Replace `YOUR-DOMAIN` in `sitemap.xml` and `robots.txt`
- [ ] Wire the contact form to a real endpoint
- [ ] Add the project screenshots, uncomment the `SCREENSHOT SLOT` blocks
- [ ] Confirm or prune the technology list
- [ ] Add Open Graph and Twitter card tags with a share image
- [ ] Check the three client links still resolve
