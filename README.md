# DA Infotech — Website

Premium static marketing site for **DA Infotech**, a technology studio in Porbandar, Gujarat.

Built with HTML5, CSS3, vanilla JavaScript, Three.js, GSAP and GSAP ScrollTrigger.
No frameworks, no build step, no package manager — the folder ships as-is to any static host.

---

## Company

| | |
|---|---|
| **Address** | First Floor, Nebhani Seri, Kadachh, Porbandar, Gujarat – 362230, India |
| **Phone** | +91-63537-57310 |
| **Email** | dainfotech7@gmail.com |

**Services** — Web & Software Development · Mobile App Development · AI & Automation · Digital Marketing

**Existing projects**
- https://porbandarchalkpowder.com/
- https://hl3rubber.com/
- http://gayatrirubberchemicals.com/

---

## Status — Phases 1–8 complete, plus creative-direction, conversion, performance, copy and final-QA reviews

**Phase 1 — foundation**
- Project structure and file wiring
- CSS custom-property token system, fluid type scale (`clamp()`)
- Container, section and grid system
- Button, link, card, badge, divider primitives
- Responsive foundation across 375 → 1920px+
- Accessibility baseline: semantic landmarks, skip link, focus states, `prefers-reduced-motion`
- Animation controller with a no-GSAP fallback

**Phase 2 — navigation and hero**
- Floating navigation: transparent at rest, blurred surface and hairline once scrolled
- Full-screen mobile menu with a clip-path wipe and staggered links, carrying real contact details
- Hero: asymmetric layout, masked line-by-line headline, CTAs, scroll cue, drafting-grid rules
- Three.js "digital technology core" — nucleus, faceted shell, cage, node network, data
  pulses, orbital rings, depth field
- Damped pointer response and a scrubbed scroll hand-off into the next section
- Three quality tiers plus a static reduced-motion mode
- Custom cursor: dot and trailing ring, desktop pointers only

**Phase 3 — services**
- Editorial register of four full-width bands, not a card grid
- Outlined numerals, per-service line marks, always-legible descriptions
- Eight-part hover choreography with pointer-tracked accent lighting and a 3D lift
- Sequential ScrollTrigger reveal through the existing `[data-animate]` system
- Touch and reduced-motion paths that carry the same information without hover

**Phase 4 — selected work**
- Three case studies on an alternating editorial rhythm, not portfolio cards
- Browser-framed site previews carrying each project's real domain
- Scrubbed choreography: frame settles out of over-scale, columns counter-drift,
  progress rail fills, numeral rises from its mask, ambient light follows the active project
- `"View Project"` cursor label on desktop; full-width CTA on touch
- All three real URLs, `target="_blank"` + `rel="noopener noreferrer"`

**Phase 5 — about, principles, process**
- About: large type against a drawn mark of nested frames that draw in on scroll
- Why: sticky headline beside a vertical principle register threaded on a filling spine
- Process: five stages on a drawn path — horizontal on desktop, vertical below 1024px —
  with a numeral reel that turns as the active stage changes
- One scroll trigger drives path, stage state and counter together

**Phase 6 — technology, contact, footer**
- Technology: orbital field driven by a single editable array, with a readable no-JS fallback
- Contact: full client-side validation, real contact details, honest no-backend submit path
- Final CTA bleeding into the footer on a shared accent
- Premium minimal footer: brand, three link columns, generated copyright year

**Phase 7 — motion, interaction and polish**
- Cursor per spec: dot → expanded ring → **VIEW** on work → **GO** on calls to action
- Header transformation: scroll-progress rail on the floating bar, bar tightens once scrolled
- `clip-path` wipe reveal on all eight section headlines
- Three.js: adaptive pixel ratio driven by measured frame time, core breathing,
  drifting light intensity, key light leaning toward the pointer
- Empty placeholder sections collapsed to zero height so the scroll journey has no dead gaps
- Focus parity across every interactive element
- Contrast recomputed and two stale claims in this file corrected

**Creative-direction review — subtraction only**

Seven phases of building accumulate decoration. This pass removed it. Nothing was added.

| Removed | Why |
|---|---|
| Uppercase on 7 section headings | Almost every heading shouted. Caps now earn their place on the hero and on small mono labels only |
| Fixed page-wide accent wash (`body::before`) | Being fixed, it tinted every section. Atmosphere everywhere is atmosphere nowhere |
| Hero drafting grid (`.hero__rules`) | Five hairlines at 0.035 alpha — too faint to read, too present to justify |
| Drifting portfolio orb (`.work__glow`) | Moved on its own, carried no information, and was the site's only layout-animating transition |
| Process counter reel | A large `03 / 05` duplicating numerals already printed under every visible stage |
| Browser traffic-light dots | A stock chrome cliché. The real domain is the honest signal |
| Per-chip bobbing in Technology | Ten labels fidgeting independently, harder to read, saying nothing |
| Contact orb drift | A 34rem shape moving 10px — imperceptible, and it held a compositor layer alive |

**Reduced, not removed** — services hover lift 26px → 12px and tilt 2.4°/1.6° → 1.2°/0.8°;
the 3D scene's six blue tints down to three, now matching `--color-accent` and
`--color-accent-soft` exactly (`ACCENT_SOFT` had drifted to a value in neither).

**Hierarchy corrected** — About was set in display type, out-ranking Services and Work. It is
a section heading like the others now; only the hero and the closing CTA sit above that tier.

**Rhythm unified** — four hand-tuned intro spacings became two tokens, `--space-label` and
`--space-intro`, used by every section.

**Conversion review — three additions**

The primary conversion is **Start a Project**. The audit found one hole and two silences.

| Added | Gap it closed |
|---|---|
| Mobile quick-action bar | Below 768px the header CTA sits inside the hamburger, so from Services through Technology there was **no reachable way to start a project** — most of the page |
| Hero proof line | The first screen answered *what* and *what next*, but never *who for* or *why trust you* |
| Services register CTA | Four bands, each silently a link, with an arrow as the only visible affordance |

**The hero proof line uses verified facts only** — the real studio location and the three
real project names. No counts, no percentages, no years, no awards. A check enforces this.

**The quick bar is not a nag.** It waits until the hero has been read, steps aside as soon as
the contact section arrives (the real form and phone number are on screen by then), hides
behind the open menu, and the footer reserves its height so it covers nothing. No timer, no
modal, no dismissal guilt.

**CTA language audited** across every link and button: no "Learn more", "Read more" or
"Click here" anywhere. The vocabulary is *Start a Project*, *View Project*, *Discuss Your
Idea*, *Send Enquiry*.

**Brutal QA — the site was finally executed**

Eight phases were verified by reading code. This pass **ran** it: `index.html` booted in a
real DOM with the real GSAP, ScrollTrigger and Three.js, then driven through scroll, resize,
menu open/close, Escape, anchor clicks, hover states and four form submissions — across five
profiles (desktop, mobile, reduced-motion, no-WebGL, save-data).

**Result: 125 assertions, zero console errors, on every profile.**

Two real defects surfaced that no static check could have found:

| Found | Fix |
|---|---|
| `init()` was not idempotent — a double boot bound every listener twice and fetched Three.js twice, which the browser reports as *"Multiple instances of Three.js being imported"* | One-line guard; the warning is gone |
| Three CDN scripts had no integrity check | SRI `sha384` on all three, hashes verified byte-for-byte against jsDelivr. The dynamically loaded Three.js sets `integrity` **before** `src`, or the attribute is ignored |

**Security review:** no secrets; **zero** dynamic-HTML sinks (`innerHTML`, `eval`,
`document.write`, `insertAdjacentHTML` — none present anywhere); 6/6 external links carry
`rel="noopener noreferrer"`; no analytics, trackers or ad tech. Two inline scripts, both
justified: the JSON-LD block (data, not code) and the pre-paint `js` class failsafe.

**Copy review — 17 blocks rewritten**

Every visible sentence audited. No banned marketing phrase was present to begin with
("cutting-edge", "leverage", "next-generation" — none), so the work was on vagueness.

| Was | Now |
|---|---|
| "…digital experiences that help businesses move forward." | "We build websites, software, mobile apps and AI automation for businesses with a real problem to solve." |
| "From websites and software to mobile applications…" *(restated the hero as a list)* | "Four services. Each one starts with the business problem, not the technology." |
| "Build fast, scalable and modern digital products…" | "Websites, web apps and internal tools, built around how your business actually runs." |
| "Create intuitive mobile experiences for modern customers…" | "Apps for your customers and apps for your team — built to be used daily, not just installed." |
| "Turn repetitive workflows into intelligent automated systems." | "The repetitive work your team does by hand, handled by software instead." |
| "Build digital visibility, attract the right audience…" | "Get found by the people already looking for what you sell, and turn that attention into enquiries." |
| "A selection of digital experiences created for businesses…" | "Three live websites, built for manufacturers in the industrial sector. See them yourself." |
| "Explore Our Work" | "View Our Work" — the brief names EXPLORE as generic |

Portfolio descriptions now say what each *site* does, not just who the client is. Process
stages carry stronger verbs. **29 sentences, average 10.4 words, none over 20.**

Two words were left alone on purpose: the Process stage "Discover" is the standard name for
that phase and was specified in Phase 5 — the brief's own "unless context makes them
appropriate" case. And the footer tagline "Digital solutions for ambitious businesses" is a
positioning line you chose, not body copy; it is the one generic phrase left, flagged rather
than overwritten.

**Phase 8 — production QA**

| Fixed | Was |
|---|---|
| Title and description | Did not match the specification |
| Open Graph completed, Twitter added | `og:url`, `og:site_name`, all Twitter tags missing |
| JSON-LD `ProfessionalService` | No structured data at all |
| `robots.txt`, `sitemap.xml` | Neither existed |
| Empty sections stopped emitting headings | Heading navigation surfaced "Introduction" and "Testimonials" with nothing under them |
| Service headings cleaned | Read as "Web & Software Development — start a project"; the link now carries that on `aria-label` |
| Footer columns `<h2>` → `<p>` + `aria-labelledby` | Put a second `<h2>Services</h2>` in the outline |
| `.hover-lift` / `.hover-glow` removed | The only styles with zero coverage anywhere |

**Before deploy:** replace `YOUR-DOMAIN` in `index.html`, `robots.txt` and `sitemap.xml`.
One find-replace; a check enforces that all three stay in step.

**No `og:image` tag is emitted.** There is no asset, and a tag pointing at a missing file is
worse than none — scrapers cache the 404. Export a 1200×630 JPG to
`assets/images/og-image.jpg`, uncomment the three lines in `<head>`, and change
`twitter:card` to `summary_large_image`.

**Performance review**

| Change | Effect |
|---|---|
| Three.js off the critical path | ~654KB no longer blocks `DOMContentLoaded`. Fetched on idle after boot |
| 54 ScrollTriggers → 1 IntersectionObserver | Reveals were creating a trigger each, all to add one class |
| Cursor rAF idles out | A motionless pointer was costing 60 frames a second |
| `will-change` off 54 pending reveals | 54 compositor layers held for the life of the page |
| Space Grotesk 400 dropped | No display element uses regular — one fewer font file |
| Load gate 1200ms → 600ms | Halves the worst-case blank screen; fonts already use `display: swap` |
| Screenshot slots upgraded | AVIF → WebP, `srcset`/`sizes`, intrinsic dimensions, lazy + async decode |

**Not done yet** — Introduction (`#intro`) and Testimonials (`#testimonials`), both awaiting
content. They keep their IDs and anchors but take no vertical space. They exist in `index.html` as empty
semantic placeholders with stable IDs.

No placeholder copy, statistics, testimonials, client names or company history have been
invented. Those sections stay empty until real content is supplied.

---

## Structure

```
da-infotech/
├── index.html            # semantic shell — header, 11 section placeholders, footer
├── styleguide.html       # internal design-system reference (noindex, not a site page)
├── README.md
├── css/
│   ├── style.css         # tokens, reset, type, layout, primitives, nav, hero, cursor, footer
│   ├── animations.css    # intro pre-states, reveal states, keyframes, reduced motion
│   └── responsive.css    # breakpoint corrections (loaded last — it overrides)
├── js/
│   ├── navigation.js     # header state, full-screen panel, scroll-spy, anchor scrolling
│   ├── cursor.js         # custom cursor (fine pointers only)
│   ├── services.js       # pointer-tracked lighting for the service bands
│   ├── technologies.js   # ⚠ editable technology list + orbital placement
│   ├── contact.js        # ⚠ form validation + no-backend submit path
│   ├── animations.js     # hero intro timeline, scroll hand-off, scroll reveal
│   ├── three-scene.js    # the digital technology core
│   └── main.js           # entry point — load gate and module boot
└── assets/
    ├── images/
    ├── icons/            # favicon.svg
    └── models/           # .glb / .gltf for the Three.js scene
```

**Load order matters.** `responsive.css` is linked last so its breakpoint rules win.
All scripts use `defer`, so they execute in markup order: `navigation → cursor →
services → technologies → contact → animations → three-scene → main`. Each module registers itself on the `DA`
namespace; `main.js` initialises them.

**The `js` class and the failsafe.** An inline snippet in `<head>` adds `js` to
`<html>` before first paint. Every rule that hides something before an animation is
scoped to `.js`, so with scripting off nothing is ever hidden. The same snippet arms a
3-second timer that releases the load gate and both `data-intro` states, so a failed or
blocked script can never leave the page blank.

---

## Running it

Open `index.html` directly, or serve the folder (recommended — matches production paths):

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`. Use `styleguide.html` to review the design system.

Libraries load from jsDelivr. To go fully offline, download `gsap.min.js`,
`ScrollTrigger.min.js` and `three.min.js` into `js/vendor/` and repoint the `<script>` tags.

> **Three.js is pinned to r160 on purpose.** r160 is the last release that ships the UMD
> `build/three.min.js`; it loads correctly but logs a deprecation notice. Later versions
> ship ES modules only, so bumping the version means switching to `<script type="module">`
> plus an import map — a real change, not a version swap. Everything still degrades safely:
> if `THREE` is absent the hero drops to its gradient fallback.

---

## Design system

### Colour

A dark, near-black base with **one** electric azure accent. No second neon, no rainbow gradients.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#08090B` | Page base |
| `--color-surface` | `#0E1014` | Cards, panels |
| `--color-surface-elevated` | `#14171D` | Raised / hovered surfaces |
| `--color-text-primary` | `#EDEFF3` | Headings, body |
| `--color-text-secondary` | `#A8AFBC` | Supporting copy |
| `--color-text-muted` | `#6E7683` | Meta, captions |
| `--color-accent` | `#2D7DFF` | Fills, rules, indicators |
| `--color-accent-soft` | `#6BA5FF` | Accent **text** on dark |
| `--color-accent-glow` | `rgba(45,125,255,.32)` | Shadow glow only |
| `--color-border` | `rgba(237,239,243,.14)` | Default borders |
| `--color-border-subtle` | `rgba(237,239,243,.07)` | Hairlines |

**Contrast** — computed, not estimated (`scratchpad/audit.js` recalculates these on every run):

| Pair | Ratio | Needs |
|---|---|---|
| `#EDEFF3` on `#08090B` — body | **17.30** | 4.5 |
| `#A8AFBC` on `#08090B` — secondary | **9.03** | 4.5 |
| `#6E7683` on `#08090B` — muted meta | **4.35** | 3.0 (large/meta only) |
| `#6BA5FF` on `#08090B` — accent text | **8.02** | 4.5 |
| `#2D7DFF` on `#08090B` — raw accent | **5.21** | 4.5 |
| `#07080A` on `#2D7DFF` — button label | **5.24** | 4.5 |
| `#FF9B9B` on the contact panel — errors | **9.58** | 4.5 |

The raw accent **does** clear AA for normal text (5.21:1), so `.project__num`,
`.cta__line--accent` and the process counter are fine as-is. `--color-accent-soft` is still
preferred for long runs of accent text, purely for legibility at small sizes.
`--color-text-muted` at 4.35:1 clears AA for large text but not for body copy — keep it on
captions, labels and meta, which is where it is used.

### Typography

`Space Grotesk` for display and headings, `Inter` for body, system mono for labels and badges.
Every step is fluid via `clamp()` — there are no font-size media queries.

`--fs-display-xl` `--fs-display-lg` `--fs-heading-xl` `--fs-heading-lg` `--fs-heading-md`
`--fs-body-lg` `--fs-body-md` `--fs-body-sm` `--fs-caption`

Matching utility classes exist for each (`.display-xl`, `.heading-lg`, `.body-md`, `.caption`).

### Layout

- `.container` — max `1440px` (`1500px` above 1920px), fluid `--container-padding`
- `.container--narrow` (920px), `.container--wide` (1680px)
- `.section` — vertical rhythm from `--section-spacing` (72px → 176px)
- `.grid` with `--grid-cols`, plus `.grid--auto` (auto-fit, `--grid-min`)
- `.stack`, `.cluster`, `.split` for one-dimensional flow

### Motion

`--speed-instant | fast | base | slow | slower` with `--ease-out`, `--ease-in-out`, `--ease-entry`.

Add `data-animate="up|up-lg|left|right|fade|scale"` to reveal an element on scroll, and
`data-animate-delay="1..6"` to stagger a group. CSS owns the transition; GSAP only flips
the `.is-visible` class, so both the GSAP and IntersectionObserver paths look identical.

---

## Navigation

The header is a transparent rail; the visible floating element is `.site-header__bar`,
which picks up a background, blur and hairline border only once `navigation.js` adds
`.is-scrolled`.

That surface lives on `.site-header__bar::before`, not on the bar. **This is load-bearing:**
`backdrop-filter` makes an element the containing block for `position: fixed` descendants,
and the full-screen mobile panel is nested inside the bar — put the filter on the bar and
the panel collapses into a 62px box. The intro timeline clears the bar's transform on
completion for the same reason.

Below 1024px the same `<nav>` becomes a full-screen panel: a clip-path wipe, then links
rising in sequence via `--i` on each item. It is pure CSS, so it behaves identically with
or without GSAP. `navigation.js` handles state, `aria-expanded`, Escape, focus containment,
and moving focus to the first link once the wipe finishes.

---

## Hero

Asymmetric by construction: the type occupies the left field and the canvas spans the whole
section, with the core offset into the right field **from inside the scene** rather than by
splitting the layout into columns. That keeps resize handling trivial and lets the depth
field drift behind the headline.

Stacking within the hero: canvas `0` · drafting rules and ambient wash `1` · content `2` ·
scroll cue `3`.

### The Three.js core

Reading outward — nucleus, faceted translucent shell, counter-rotating cage, a node sphere
joined by proximity links, pulses travelling those links, inclined orbital rings, and a
sparse depth field.

Everything except the shell is unlit and additively blended. Two reasons: it glows without
a post-processing pass, and the composition does not depend on how a browser resolves
physical light units. All transparent materials use `depthWrite: false`, so the scene
composites in painter's order by `renderOrder` — a deliberate holographic read, and the
reason there are no transparency sorting artefacts.

The node layout, jitter, link selection and ring inclinations all come from a deterministic
`sin`-based hash, so the composition is **identical on every load** — it behaves like brand
imagery, not like a random field.

Framing is solved, not hard-coded: `frameCamera()` computes the camera distance needed to
hold `COMPOSITION_RADIUS` in both axes, which is why a 21:9 monitor and a 375px phone both
land correctly without per-breakpoint tuning.

### Interaction

The pointer never drives rotation directly. It moves a target that the scene eases toward
with frame-rate independent damping (`1 - e^(-λΔt)`), which is what keeps motion identically
weighted at 60Hz and 144Hz. Scroll is scrubbed through `setScroll(0..1)`: the core sinks and
rotates, the camera pulls back, the key light drops and the rim light rises, and the ambient
wash fades via the `--hero-glow` custom property.

### Performance tiers

| Tier | Trigger | Nodes | Links | Particles | Pulses | DPR cap | AA |
|---|---|---|---|---|---|---|---|
| high | > 1200px, > 4 cores, > 4GB | 82 | 190 | 850 | 26 | 2.00 | yes |
| medium | ≤ 1200px, ≤ 4 cores or ≤ 4GB | 54 | 120 | 440 | 15 | 1.75 | yes |
| low | ≤ 768px | 30 | 62 | 170 | 8 | 1.50 | no |

Measured vertex counts: 3,198 (high) → 1,124 (low). The loop also pauses when the canvas
scrolls offscreen or the tab is hidden, clamps delta to 50ms so a stall never causes a
lurch, and releases the context cleanly on `webglcontextlost`.

Under `prefers-reduced-motion` the scene still **builds and renders one frame** at a resting
angle, then stops — present and composed, but static. It is not removed; there is nothing to
gain from showing that user an empty column.

---

## Services

An editorial register, not a card grid: four full-width bands separated by hairlines,
each carrying an outlined numeral, a line mark, a title and its description.

**Nothing on hover changes layout.** The bands read as expanding — the accent panel scales
past the row edges, content shifts right, the row lifts 26px in Z — but every row keeps its
box. Animating real height would move the rows below it, so a pointer travelling down the
list would land on a different service than the one it was aimed at. The illusion is worth
more than the literal effect.

Eight responses fire on one intent: the top hairline lights left-to-right, the numeral
outline turns accent and slides out, the mark lifts and colours, the title goes to pure
white, the description brightens and shifts, the arrow fills and glows, the accent wash
fades up, and the whole band tilts toward the cursor. Everything is CSS transitions on
transforms and colours; GSAP is not involved.

`js/services.js` only sharpens what already works. It writes four custom properties —
`--mx`, `--my`, `--tilt-x`, `--tilt-y` — that CSS has resting defaults for, reading on the
event and writing on the next frame so crossing the register cannot thrash layout. With the
module absent, on touch, or under reduced motion, the wash simply sits still and every other
response runs unchanged.

The reveal uses the existing `[data-animate]` system with `data-animate-delay="1..4"`, so
ScrollTrigger sequences the bands whether they enter the viewport together or one at a time.

**On touch** the descriptions and marks carry their full hover colours at rest — no
information is behind a hover — and `:active` supplies the acknowledgement instead.

Each band links to `#contact` via an overlay on the title link, which is what makes the
animating arrow honest. The trade-off is that the description text is not selectable; that
is the cost of a band-wide hit area, taken deliberately.

---

## Selected work

Three case studies on an alternating rhythm — visual left, then right, then left — each a
framed site preview beside its own meta column. Not a card grid, and not small.

### Screenshots

**There are none, and nothing pretends otherwise.** Each frame is a browser shell carrying
the project's real domain, and the viewport holds a drawn placeholder: the project monogram
outlined over a technical grid. It reads as a designed state, not as a broken image and not
as an imitation screenshot.

Adding a real one is a one-line change — uncomment the `<img class="project__img">` already
sitting in each `.project__media`:

```html
<img class="project__img" src="assets/images/hl3-rubber.webp"
     alt="HL3 Rubber website" width="1600" height="1000" loading="lazy">
```

The image is a later sibling on a higher layer, so it covers the placeholder with no other
edit and no `:has()` dependency. The frame holds `aspect-ratio: 16 / 10`, so dropping images
in shifts nothing.

### Copy

Every description states only what the live site itself publishes — verified by reading all
three before writing a word. No results, traffic, revenue, conversion, award or testimonial
claims exist anywhere in the section. The clients' own operational figures and certifications
(floor area, monthly output, ISO/IATF/RDSO) were deliberately **left out**: they are the
clients' claims about themselves, not DA Infotech's work, and they do not belong in this
portfolio.

### Choreography

Per case study, all scrubbed through ScrollTrigger: the frame settles out of a 1.09
over-scale as it crosses the viewport, the two columns counter-drift ±38px, the progress rail
fills across the project's own passage, and the numeral rises once out of its mask. The
section's ambient light moves to whichever project is active — positioned rather than
repainted, because `background-position` inside a gradient shorthand cannot transition but
`inset-inline-start` can.

The hover zoom lives one level below the scrubbed element, so the scrub and the zoom multiply
instead of fighting over the same `transform`.

### Links and focus

Each project has exactly **one tab stop**. The frame is a mouse affordance — `tabindex="-1"`,
`aria-hidden="true"` — and the CTA is the real link, carrying an sr-only project name and a
new-tab warning. All six external links use `target="_blank"` with `rel="noopener noreferrer"`.

---

## About, principles, process

**About.** The supplied sentence is the whole of the copy — no founding date, team size,
years of experience, client count, certification or award has been added, and an audit
check enforces that. The only addition is the studio location, which is already published
elsewhere on the page. The mark beside it is nested frames rotating out of a solid core:
they draw themselves in on scroll via `stroke-dashoffset`, using a single dash constant
larger than any frame's perimeter rather than `getTotalLength()`, which is unreliable on
`<rect>` across engines.

**Why.** Deliberately not the Services register again: the headline holds position while
four principles pass it, threaded on a spine that fills as each arrives. Nodes latch once
lit — scrolling back up should not unmake progress the reader already saw. The spine runs
past the final node, so its tail is masked out instead of stopping dead against the last
paragraph.

**Process.** Five stages on a drawn path, horizontal on desktop and vertical below 1024px.
The scrub publishes a `--path-progress` custom property rather than writing a transform, so
**the same 0→1 value drives both layouts** and the axis stays CSS's decision — `scaleX` in
`style.css`, `scaleY` in `responsive.css`. One trigger updates the path, the active stage
and the counter together.

The counter is a reel of all five numerals translated behind a mask, so no numeral is ever
rewritten mid-scroll.

Stage descriptions are legible in every state. "Active" raises a stage; it never reveals
one. Scrolling past must not take information away, which is also why reduced motion marks
every stage done rather than singling one out.

> **The five stage names were supplied; their one-line descriptions were not.** They plainly
> restate the activity each name implies and claim nothing about timelines, deliverables or
> outcomes. They are marked in `index.html` as safe to edit.

---

## Technology  ⚠ needs your confirmation

**The list on the page is not verified.** It is the candidate list from the brief, seeded so
the section is complete and reviewable — it is not an inventory of what DA Infotech works
with. Prune it before launch.

Edit one array, at the top of `js/technologies.js`:

```js
var TECHNOLOGIES = ['JavaScript', 'React', 'Next.js', /* … */];
```

The markup is rebuilt from it. Set it to `null` to keep whatever is written in `index.html`
instead. The same list is also written statically in the markup as the no-JavaScript
fallback, where it reads as a plain register.

For what it's worth as evidence: checking the three portfolio sites turned up **no React,
Next.js or WordPress signatures** — one uses Bootstrap, the other two look hand-built. That
says nothing about what the team can do, but it means the portfolio does not corroborate the
front-end framework entries. Confirm them from your own knowledge.

**Layout.** Chips do not orbit — the rings rotate and the chips breathe on the spot, so a
hover target never slides out from under the pointer. Orbital placement is applied only once
coordinates are assigned (`.is-orbital`), and below 900px the plain register is simply the
better layout, so no orbit is applied at all.

---

## Contact  ⚠ no backend

**The form does not send email, and does not claim to.** With `ENDPOINT` null it validates,
then opens the visitor's mail client with the enquiry pre-filled, and says exactly that:
*"Your email app should now be open with these details filled in — press send there to reach
us."* The word "sent" appears only inside the endpoint branch, which is unreachable until
you configure one. An audit check enforces that separation.

To wire it up, set one constant in `js/contact.js`:

```js
var ENDPOINT = 'https://formspree.io/f/xxxxxxx';   // or Netlify Forms, Basin, your own
```

The submit path switches to `fetch` POST and the on-screen note changes with it. Nothing
else needs editing.

**Validation** is announced, not just coloured. Every message is text, tied to its field
with `aria-describedby`, mirrored in `aria-invalid`, summarised in an `aria-live` status
region, and the first failing field takes focus. Required: name, email, project details.
Phone is optional but format-checked once filled. A honeypot field catches the simplest
bots — no substitute for server-side checks once a backend exists.

Budget is a free-text field on purpose: a select would have meant inventing price bands.

---

## Custom cursor

A dot tracking the pointer and a ring trailing behind it, both damped.

| Over | Response |
|---|---|
| nothing | 6px dot |
| a link | ring expands to 1.55×, border goes accent, dot dims |
| a call to action | ring fills accent at 2.35× and reads **GO** |
| a portfolio frame | ring fills accent at 2.75× and reads **VIEW** |

The label is a **sibling** of the ring, never a child: the ring scales to 2.75× and type
inside it would stretch with it.

Driven by `data-cursor="link|cta|text"`, with `data-cursor-text` overriding the wording and an
automatic fallback to any `a`, `button` or `[role="button"]`. It builds only on
`(hover: hover) and (pointer: fine)` with motion enabled, hides itself on Tab, never touches
text inputs, and `cursor: none` applies only while it is running.

---

## Performance

**Adaptive quality.** Device tiers are a guess made from screen width and core count. The
scene also *measures*: if frame time stays above 25ms across a 90-frame window, the pixel
ratio steps down 0.25 (floor 0.75) and the renderer is resized. It only ever steps down, so
it cannot oscillate, and pixel ratio is the cheapest large saving available — invisible next
to a stuttering canvas. `ratioScale` resets on teardown.

**Scroll handling.** The header progress rail writes a custom property driving a `scaleX`,
never a width. The document height it divides by is cached and re-measured on resize, load
and body resize — reading `scrollHeight` inside the scroll handler would force a layout on
every frame, which is the exact cost the rail is meant to avoid.

**Animated properties.** Everything animates `opacity`, `transform`, `clip-path` or a custom
property feeding a transform. One knowing exception: `.work__glow` transitions `inset`,
because a gradient's position inside the `background` shorthand cannot transition. It is
absolutely positioned with no in-flow siblings, so it dirties layout for itself alone, and
the transition runs at most three times per visit.

**Critical path.** Only GSAP and ScrollTrigger are deferred in the markup. Three.js is
deliberately *not* — at ~654KB it is the largest asset on the page, and a deferred script must
finish parsing before `DOMContentLoaded`, so it would have delayed navigation, the cursor, the
form and every reveal for a decorative background. `js/main.js` fetches it on
`requestIdleCallback` after boot, and the scene reveals itself on arrival rather than riding
the hero timeline — the intro never waits on a network request.

**Low-performance mode.** The scene is skipped entirely on `Save-Data`, on 2G, and below 2GB
of device memory; the hero falls back to its gradient. Motion preference is deliberately *not*
a trigger for this — someone who asked for less movement still gets the composition, just
still. Bandwidth and memory are the axes that justify dropping the asset.

**Reveals.** 54 `[data-animate]` elements run on a single IntersectionObserver rather than 54
ScrollTriggers. The CSS transition was doing the actual animation either way; ScrollTrigger is
now reserved for the 11 genuinely scrubbed sequences.

**Idle cost.** The cursor loop stops when the pointer settles and wakes on input. The scene
loop pauses offscreen and on a hidden tab. Four `will-change` promotions remain, all on
elements that are continuously animated.

**What has not been measured.** Real frame rate, CPU, GPU and memory on actual hardware.
Those need a browser and a profiler; nothing here substitutes for them.

It builds only on `(hover: hover) and (pointer: fine)` with motion enabled, and re-evaluates
if either changes mid-session. `cursor: none` is applied only while it is running, never on
text inputs, and the elements are `aria-hidden` and `pointer-events: none`. Pressing Tab
hides it — a keyboard user is not tracking a pointer.

---

## Component reference

| Class | Purpose |
|---|---|
| `.btn` + `.btn--primary` / `--secondary` / `--ghost` | Buttons; sizes `--sm` `--lg` `--block` |
| `.btn__icon` | Arrow that slides on hover |
| `.link` / `.link-arrow` | Inline prose link / arrow affordance |
| `.card` + `--interactive` `--rule` `--bare` | Content surfaces |
| `.badge` + `--accent` `--outline` | Small labels; `.badge__dot` for status |
| `.divider` + `--fade` `--accent` `--vertical` | Rules |
| `.section-label` | Monospaced eyebrow above a heading |
| `.section-heading` | Label + title + lead block |
| `.surface` `.surface-elevated` `.surface-sunken` | Bare surface tokens |
| `.service` + `__index` `__mark` `__title` `__text` `__arrow` `__glow` `__rule` | Service band |
| `.project` + `__frame` `__chrome` `__shot` `__media` `__placeholder` `__meta` `__rail` | Case study |

### Behavioural hooks added in Phase 2

| Attribute | Read by |
|---|---|
| `data-header` / `data-header-bar` | `navigation.js`, intro timeline |
| `data-nav` / `data-nav-toggle` | `navigation.js` |
| `data-hero` / `data-hero-canvas` | `main.js`, `animations.js` |
| `data-hero-el="label\|lead\|actions\|scroll"` | intro timeline |
| `data-hero-line` | masked headline lines |
| `data-cursor="link\|cta"` | `cursor.js` |
| `--i` (inline, on nav items) | panel link stagger |
| `data-service` | `services.js` pointer tracking |
| `data-work` / `data-project` | `animations.js` `initWork()` |
| `data-project-media` `-meta` `-rail` `-num` | scrubbed case-study parts |
| `data-cursor-text` | cursor label wording |
| `--work-x` `--work-y` | ambient light position per active project |
| `data-tech-system` / `data-tech-list` | `technologies.js` |
| `--a` `--r` `--i` | chip angle, orbit radius, breathing offset |
| `data-contact-form` / `data-form-status` | `contact.js` |
| `--mx` `--my` `--tilt-x` `--tilt-y` | service band lighting and tilt |

---

## Accessibility

- Semantic landmarks (`header`, `main`, `section`, `footer`), one `h1`, labelled sections
- Skip link to `#main`
- `:focus-visible` rings with offset; no focus is ever suppressed. Panel links use an inset
  offset so the masking overflow cannot clip the ring
- Mobile nav: `aria-expanded`, `aria-controls`, Escape to close, focus moves to the first
  link on open and returns to the toggle on close, Tab is contained
- Scroll-spy sets `aria-current` on the active link
- Touch targets ≥ 44px (48px on coarse pointers)
- The hero headline is written in sentence case and uppercased in CSS, so its accessible
  name stays "Build. Automate. Grow."; the canvas and all decoration are `aria-hidden`
- `prefers-reduced-motion: reduce` disables every transition, keyframe and hover motion,
  shows the hero with no intro sequence, drops all scroll-linked effects, switches anchor
  scrolling to instant, suppresses the custom cursor entirely, and renders the 3D scene as
  a single static frame
- Without JavaScript nothing is hidden — every pre-animation state is scoped to `html.js`,
  and a 3-second inline failsafe releases them if a script never arrives

---

## Responsive

Breakpoints: **1920 · 1440 · 1200 · 1024 · 768 · 480 · 375**, plus a short-landscape rule and
`hover`/`pointer` queries. Mobile is not an afterthought: type, spacing and padding are fluid
by default, and the breakpoints only handle what fluid values cannot — layout mode switches
and navigation behaviour. Navigation collapses at 1024px.

---

## Conventions

- BEM-ish naming: `.block`, `.block__element`, `.block--modifier`
- No hard-coded colours, sizes or durations in component CSS — always a token
- Component-level knobs are local custom properties (`--btn-bg`, `--card-padding`, `--grid-min`)
- Logical properties (`inline-size`, `padding-block`) throughout
- JavaScript modules are IIFEs on the `DA` namespace, ES5-compatible, initialised by `main.js`
- Behavioural hooks use `data-*` attributes; state uses `is-*` classes — never style a `data-` hook

---

## Before launch

**Blocking — content and confirmation**
1. Prune `TECHNOLOGIES` in `js/technologies.js` to what the team actually uses
2. Set `ENDPOINT` in `js/contact.js`, or accept the mail-client handoff
3. Project screenshots into `assets/images/` (three commented `<img>` stubs are waiting)
4. Real client quotes, or drop `#testimonials` entirely
5. Decide `#intro` — build it, or remove it and repoint the hero's scroll cue at `#services`

**Not yet scheduled**
- `og:image`, `og:url`, `twitter:card`, `robots.txt`, `sitemap.xml`
- `styleguide.html` still documents only Phase 1 primitives
- Performance, SEO and cross-browser QA
- **Nothing has been opened in a browser yet** — every phase is verified structurally
#   d a - i n f o t e c h - w e b s i t e  
 #   d a - i n f o t e c h - w e b s i t e  
 