# Evergreen Consulting — site

Marketing site for Andrea Schiralli (d/b/a Evergreen Consulting), college admissions essay consultant. Astro, static output, plain CSS, no UI framework.

```bash
npm run dev     # http://localhost:4321
npm run build   # dist/
```

## Structure
- `src/layouts/Base.astro` — head/SEO (canonical, OG, JSON-LD ProfessionalService + Person), nav, footer, the one scroll-reveal observer.
- `src/styles/global.css` — all design tokens. Change colors/type here only.
- `src/data/services.json` — services; edit copy here, both home and /services read it.
- `src/data/results.json` — acceptances by year/category (scraped from andiesconsulting.com/results).
- `public/resources/` — the two free downloads (PDF + DOCX).
- `public/logos/` — university seals pulled from Wikipedia page thumbnails (`src/data/logos.json`). `public/press/` — press logos recovered from the old Ivy & Quill site.
- `src/components/Chat.astro` — floating FAQ chat. Swap the body of `ask()` for a fetch when there is an API.
- Source material: `../waybackmachine/` (old WordPress dump + Ivy & Quill Wayback recovery, incl. 40+ blog posts under `content-markdown/`).

## Design rules
- Palette: ink, evergreen, moss, sage, paper, linen, brass. Brass is the editor's pen: hero strike/caret, nav underline. Don't use it elsewhere.
- Type: Fraunces (display, weights 300–400) + Albert Sans (body, and the hero's inserted phrase at 500). No third face, no italics in the hero.
- One bold moment only: the hero "edit" animation. Section reveals are opt-in via `data-reveal` on headings — not on every card.
- Thin `--rule` borders, no drop shadows, no gradients, 2px radius max.
- Every page: `<h1>` once, `.page-head` section, then `.section` blocks.

## Copy voice
- Direct. Short and medium sentences. A little dry humor. Written to parents and consultants, not to students.
- No em dashes anywhere. No AI-slop patterns (see the no-ai-slop skill): no "not X, but Y", no colon reveals, no "leverage/elevate/journey".
- Andrea is a college admissions consultant with packages (Golden Ticket, Quick Silver, à la carte), not only an essay editor.

## SEO keyword map (from the Moz research xlsx, University/Grad tabs)
| Page | Primary topic | Supporting terms |
|---|---|---|
| / | college admissions essay consulting | college essay editing, personal statement |
| /services | college admissions essay editing | personal statement review, college application resume editing, college admissions interview prep, graduate school admission essay editing, statement of purpose, B2B essay editing |
| /about | Andrea Schiralli college essay consultant | Harvard, Cornell, educator |
| /results | college acceptances | Ivy League, top-100 universities |
| /resources | how to write a college application essay | Common App essay prompts 2026-2027, personal statement examples, UC personal insight questions, why this school essay |
| /contact | college essay consultation | — |

Rule from the research: a primary keyword is the *topic* of a page; use natural variations, don't repeat the phrase.

## TODO before launch
- Domain is set to evergreenconsulting.co; confirm before launch.
- Email is andrea@evergreenconsulting.co everywhere; confirm +1 203-703-2710 is still current; point the contact form `action` at Formspree/Netlify Forms.
- Logos: `public/logo-mark.png` (nav, favicon) and `public/logo.png` (footer, inverted). Marquee component for premium motion; keep to one per page.
- University seals are trademarks; common on consultant sites but Andrea should be OK with it, or swap for text.
- Testimonials page (none collected yet).
- Blog: 40+ Ivy & Quill posts in the wayback folder are Andrea's own writing and can be republished under `/blog/` for SEO/GEO.
- Wire the chat widget to an API.
