# Gulmohar Early Years — preschool landing page

A single-page, static demo site for pitching website work to Indian preschools.
Plain HTML, hand-written CSS and vanilla ES modules. **No build step, no framework,
no npm install.** Open `index.html` and it runs.

Fictional demo brand: *Gulmohar Early Years*, a Montessori-inspired preschool in
Bopal, Ahmedabad.

---

## Running it

Because the JS uses ES modules, opening the file over `file://` will fail CORS.
Serve the folder over HTTP:

```bash
python -m http.server 8099
# then open http://127.0.0.1:8099/index.html
```

Deploying is just uploading the folder — Netlify, Vercel, Cloudflare Pages or any
static host will serve it as-is.

---

## Structure

```
index.html                  the whole page — 19 sections
assets/
  css/
    fonts.css               @font-face for the 3 self-hosted families
    tokens.css              design tokens + reset   ← rebrand starts here
    style.css               layout + components
    animations.css          keyframes + scroll-reveal states
  js/
    main.js                 entry point
    modules/
      nav.js                header — condense, hide-on-scroll-down, reading
                            progress, sliding highlight, scroll-spy, drawer
      reveal.js             scroll reveals + word-split headings
      counters.js           animated statistics
      tabs.js               daily-schedule tabs (WAI-ARIA pattern)
      accordion.js          FAQ
      gallery.js            bento category filter
      form.js               validation + WhatsApp handoff
      scroll.js             Lenis smooth scroll + GSAP parallax
  fonts/                    self-hosted woff2
  images/                   see CREDITS.md
CREDITS.md                  image/font/script licensing — read before going live
_palette-options/           rendered colour alternatives (safe to delete)
```

---

## Rebranding for a client

**1. Colour.** Everything routes through four ramps in `assets/css/tokens.css`.
Change these values and the whole site follows — nothing else references a raw colour.

| Token ramp | Meaning | Current |
|---|---|---|
| `--brand-100…700` | Primary | teal |
| `--accent-100…600` | Accent / CTA | coral |
| `--deep-700…900` | Dark panels, footer, all borders | deep teal |
| `--base`, `--base-2`, `--base-3` | Page surfaces | cream |

`_palette-options/` holds six rendered alternatives if you want a different scheme;
each file's hex values are in this repo's history.

**2. Type.** Three families in `tokens.css` (`--font-display`, `--font-body`,
`--font-script`). To swap, drop new `.woff2` files into `assets/fonts/` and update
`assets/css/fonts.css`.

**3. Content.** Search `index.html` for these and replace:

- `Gulmohar` / `Early Years` — brand name (also in the two inline SVG logos)
- `+91 98250 12345` — appears in the header, enquiry section, footer, JSON-LD, and
  as `919825012345` in three `wa.me` links
- `WA_NUMBER` in `assets/js/modules/form.js` — **easy to miss**, this drives the
  form's WhatsApp handoff
- `hello@gulmoharearlyyears.in`, the Bopal address, the six centre names
- The `<script type="application/ld+json">` block at the bottom

---

## The enquiry form

There is **no backend**. On submit the form validates, then opens WhatsApp with the
enquiry pre-filled — which is how most Indian preschool enquiries actually convert.

To post to a real endpoint instead, edit `assets/js/modules/form.js` and replace the
`window.open(...)` call in the submit handler with a `fetch()` to Formspree,
Web3Forms, or Netlify Forms. The validation logic above it stays as-is.

Validation currently enforces: name ≥ 2 chars; a 10-digit Indian mobile starting 6–9;
a date of birth that is in the past and under 7 years.

---

## Motion

- **Scroll reveals and counters** use `IntersectionObserver` — no dependency, so
  content can never get stuck invisible.
- **Smooth scrolling** (Lenis) and **parallax** (GSAP ScrollTrigger) load from a CDN
  and are purely additive. An automated test blocks both CDNs and confirms the page
  stays fully readable and functional.
- `prefers-reduced-motion: reduce` disables Lenis, all parallax, marquees, and every
  reveal animation. The `.js-motion` class that enables hide-then-reveal is only added
  when reduced motion is *off*, so there is no way for content to be hidden with no
  animation to bring it back.

---

## Verified

Automated checks run against the built page (27/27 passing):

- tabs — click, `ArrowLeft`/`ArrowRight`/`Home`/`End`, correct `aria-selected` and panel visibility
- accordion — opens, has height, opening one closes the others
- gallery filter — shows only the chosen category, `aria-pressed` correct, "Everything" restores
- form — blocks empty submit, rejects malformed mobile numbers, strips non-digits,
  caps at 10, rejects future dates of birth
- counters — reach their exact final values including the `4.8` decimal
- mobile — burger opens the drawer, `Escape` closes it, drawer sits on-screen,
  **no horizontal overflow at 390px**
- CDN blocked — hero visible, below-fold content still reveals, no uncaught errors
- no uncaught JS errors, no failed requests

Not yet done: a Lighthouse pass, an `axe` accessibility audit, and testing on a real
Android device.

---

## Known limitations

**Photography age range.** Every photograph on the page is now one Indian Montessori
shoot — genuine Indian children in a genuine Montessori preschool, in uniform and
working with real materials — plus three toddler portraits in the polaroid strip. The
Gujarat *school* frames that used to fill three gallery slots are gone; they showed
primary and secondary students aged roughly 8–14.

The children in the classroom frames still read as roughly 5–7 rather than the 1.5–5.5
the site advertises, and that is a hard limit of free stock rather than an oversight.
Searching Pexels four different ways returns one of three things: genuine 2–4 year olds
in Western preschools, Indian toddlers photographed at home or in rural/anganwadi
settings that read as documentary rather than as a private preschool, or this Montessori
shoot. Indian toddlers in a modern private play school essentially do not exist under a
free licence — a paid library (ImagesBazaar, Getty, Shutterstock) covers it properly.
For a real client, a half-day shoot at their own centre replaces all of it and will look
far better than any stock.

**Demo content is fictional.** Staff, parents, quotes and the 4.8★ rating are invented
and attached to stock models. See the warning in `CREDITS.md` before publishing.

**One page only.** Nav links are in-page anchors. Adding real pages means splitting
sections out and switching the anchors to file paths.
