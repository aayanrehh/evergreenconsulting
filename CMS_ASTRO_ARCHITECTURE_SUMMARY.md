# TinaCMS + Astro Architecture & Change Summary

**Repository**: `aayanrehh/evergreenconsulting`  
**Current Branch**: `feat/full-site-cms-editing` (Commit `1c3a9cb`)  
**Base / Production Branch**: `main` (Commit `bf4c05a`)  
**Date**: September 20, 2026  

---

## 1. Current State of the TinaCMS + Astro Project

### Architecture Overview
The Evergreen Consulting website is built with a modern, decoupled JAMstack architecture designed for maximum performance, minimal hosting overhead, and easy client editing:

```mermaid
flowchart LR
    subgraph Client Admin
        A["Admin User (/admin)"] -->|Authenticates| B["TinaCloud"]
    end

    subgraph Git Repository
        B -->|Commits content edits| C["GitHub (Repo / JSON & Markdown)"]
        Dev["Developer (git push)"] -->|Pushes template / code changes| C
    end

    subgraph Production Hosting (Hostinger)
        C -->|Build Trigger / Deploy| D["Static Astro Build (node tina/build.mjs)"]
        D -->|Compiles HTML / CSS| E["Static Distribution (/dist)"]
        E -->|Served to visitors| F["End Users (Fast, 0ms SSR overhead)"]
    end
```

- **Frontend Framework**: **Astro (Static Output / SSG)**.
  - Pure HTML and plain CSS (no heavy runtime JavaScript libraries like React or Vue running on the public client pages).
  - High performance (sub-second build times, 100/100 Lighthouse performance, instant page loads).
- **Headless CMS**: **TinaCMS (Git-backed)**.
  - All content is stored directly inside the repository as human-readable JSON files (`src/data/*.json`) and Markdown files (`src/content/blog/*.md`).
  - Content changes create Git commits automatically; there is no SQL or external proprietary database to manage or migrate.
- **Production Admin (`/admin`)**:
  - Runs as a static Single Page Application (SPA) backed by TinaCloud.
  - When Andrea or an editor logs in, TinaCloud handles user authentication and commits approved edits directly to the GitHub repository.
  - Hostinger detects the commit, runs `npm run build`, and regenerates the static site.

---

### Previous Defect Resolutions Leading to Current State

Prior to this update, several foundational issues were diagnosed and resolved:

1. **Eliminated "Blank Sidebar / TinaCMS form fields will appear here"**:
   - *Problem*: Collections had `ui.router` configured. TinaCMS interpreted this as a request for "Contextual/Visual Editing" using an iframe. Because Astro is deployed as a purely static site with no runtime React or SSR bridge to post messages to Tina's iframe, the sidebar was waiting indefinitely for a handshake that never came.
   - *Fix*: Removed `ui.router` and configured singleton collections with `global: true`. When an editor clicks any collection in `/admin`, the full form editor loads immediately with all current site data pre-populated.

2. **Resolved Media Manager Showing "0 Media Files"**:
   - *Problem*: Tina was configured with `mediaRoot: 'uploads'`, expecting all images to reside in `public/uploads/`. However, the repository organizes media directly under `public/` (e.g., `andrea.jpg`, `wechat-qr.jpg`, `public/resources/`, `public/logos/`, `public/press/`).
   - *Fix*: Updated `mediaRoot: ''`. Tina's Media Manager now roots directly at `public/`, immediately displaying all existing photos, documents, and subfolders. Future media uploads go into the same folder structure.

3. **Connected Free Resources & Quick Reads to CMS**:
   - *Problem*: `src/pages/resources.astro` hardcoded the download links, bullet outlines, and all 6 educational guides.
   - *Fix*: Migrated all downloads and quick read guides into `src/data/resources.json` and refactored `resources.astro` to dynamically render from the CMS data.

---

### Current Git & Branch Status
- **`main`**: Contains the stable production base (media manager fix, resources connection, and quick reads editing).
- **`feat/full-site-cms-editing`**: Contains the full-site page-level architecture and the Results page card fix.
- **Build Status**:
  - `npx tinacms audit`: Passed (`✅ Audit passed`) across all 7 collections.
  - `npm run build`: 10 static routes generated in ~690ms with 0 errors.

---

## 2. What the Changes Entail

### Core Objective
Transform every hard-coded text blurb, bullet point, step, credential, and photo caption across the entire website into a **Single Source of Truth (SSoT)** managed in TinaCMS, organized logically **page by page**.

```
TinaCMS Admin Form (/admin)
  │
  ▼
Structured JSON/Markdown Files (site/src/data/*.json, site/src/content/blog/*.md)
  │
  ▼
Astro Page Templates (site/src/pages/*.astro)
  │
  ▼
Static Production HTML (dist/**/*.html)
```

---

### Detailed Breakdown of Changes by Page

#### A. Results Page (`/results/`): 2023 Card Default State
- **File Modified**: [`site/src/pages/results.astro`](file:///Users/johnny/Documents/evergreenconsulting/site/src/pages/results.astro)
- **Change**: Removed `open={i === 0}` from the `<details class="year">` element.
- **Effect**: Previously, the top card (2023) was automatically open when the page loaded. Now, **all 9 year cards (2023 down to 2015) are closed by default**, creating a clean, consistent accordion layout.

---

#### B. Front Page (`/`)
- **Backing File**: [`site/src/data/home.json`](file:///Users/johnny/Documents/evergreenconsulting/site/src/data/home.json)
- **Template Wired**: [`site/src/pages/index.astro`](file:///Users/johnny/Documents/evergreenconsulting/site/src/pages/index.astro)
- **Tina Admin Collection**: **Front Page** (`front`)
- **Editable Blurbs & Content**:
  1. **Hero Section**:
     - `titlePrefix`: `"The college application,"`
     - `strikeText`: `"survived"` (preserves the animated strikethrough effect)
     - `insertText`: `"done well."` (preserves the green editor insert animation)
     - `lede`: Main introductory statement
     - `primaryCta` & `secondaryCta`: Button labels and links
     - `photo` & `photoCaption`: Andrea's portrait and caption
     - `facts`: Array of 4 key numbers and labels (e.g. "20,000+ essays coached and edited", "10 years consulting", "100% acceptance rate", "1:1 coaching")
  2. **Where Students Have Gone (Band)**:
     - Heading, descriptive lede, and button text linking to Results.
  3. **"How Andrea Works" Section** *(explicitly requested)*:
     - Section `heading`: `"How Andrea works"`
     - Section `photo` & `photoCaption`: Conference keynote photo and caption
     - `lede`: Introductory hook ("Admissions officers read thousands of essays...")
     - `paragraphs`: Array of methodology narrative paragraphs
     - `steps`: Array of 4 process step cards (Brainstorm, Outline & draft, Comment, Edit & finalize)
     - `promises`: Array of 4 guarantee cards (72 hours, Parents in the loop, No AI, One story)
  4. **Packages Teaser & Contact Section**:
     - Headings, introductory muted blurbs, and conversation prompts.

---

#### C. About Andrea (`/about/`)
- **Backing File**: [`site/src/data/about.json`](file:///Users/johnny/Documents/evergreenconsulting/site/src/data/about.json)
- **Template Wired**: [`site/src/pages/about.astro`](file:///Users/johnny/Documents/evergreenconsulting/site/src/pages/about.astro)
- **Tina Admin Collection**: **About Andrea** (`about`)
- **Editable Blurbs & Content**:
  - `name` and headline `lede`.
  - Portrait image and alt text.
  - **"The short version"**: Section heading and multiple narrative paragraphs.
  - **Education**: Credentials list with school names and degree details (Harvard, Cornell, etc.).
  - **Experience**: Array of professional history bullet points.
  - **Photos**: Gallery/carousel items with image paths, alt tags, and captions (speaking and workshop photos).
  - **Note to parents**: Heading, paragraph text, CTA label, and link.

---

#### D. Services (`/services/`)
- **Backing File**: [`site/src/data/services.json`](file:///Users/johnny/Documents/evergreenconsulting/site/src/data/services.json)
- **Template Wired**: [`site/src/pages/services.astro`](file:///Users/johnny/Documents/evergreenconsulting/site/src/pages/services.astro)
- **Tina Admin Collection**: **Services** (`services`)
- **Editable Blurbs & Content**:
  - `pageHeading` and `pageLede`.
  - `processHeading` ("How it works") and `processMuted` descriptive copy.
  - `coachingSteps`: 4 detailed steps for comprehensive coaching.
  - `commentingSteps`: 3 detailed steps for written feedback.
  - Service packages (Golden Ticket, Quick Silver, à la carte) with pricing tags, summaries, bullet details, and keywords.

---

#### E. Free Resources (`/resources/`)
- **Backing File**: [`site/src/data/resources.json`](file:///Users/johnny/Documents/evergreenconsulting/site/src/data/resources.json)
- **Template Wired**: [`site/src/pages/resources.astro`](file:///Users/johnny/Documents/evergreenconsulting/site/src/pages/resources.astro)
- **Tina Admin Collection**: **Free Resources** (`resources`)
- **Editable Blurbs & Content**:
  - Downloads: PDF/DOCX downloads, badges, blurbs, outline bullets, download button labels.
  - Quick Reads: Complete content for all 6 guide sections (Dos and Don'ts, Avoid, Prompts, Brainstorming, Structure, Style) including titles, introductory text, bullet tips, questions, definitions, and footnotes.

---

#### F. Contact (`/contact/`)
- **Backing File**: [`site/src/data/contact.json`](file:///Users/johnny/Documents/evergreenconsulting/site/src/data/contact.json)
- **Template Wired**: [`site/src/pages/contact.astro`](file:///Users/johnny/Documents/evergreenconsulting/site/src/pages/contact.astro)
- **Tina Admin Collection**: **Contact** (`contact`)
- **Editable Blurbs & Content**:
  - Page heading and lede.
  - Direct reach heading, email, phone.
  - WeChat QR image and WeChat instructional note.
  - Location notice (timezone / remote consulting info).
  - Agency policy notice.
  - Floating chat assistant tip.

---

#### G. Blog & Reviews
- **Blog (`site/src/content/blog/*.md`)**: Editable markdown articles with metadata (title, date, description, image).
- **Reviews (`site/src/data/reviews.json`)**: Google review rating score, total review count, link to Google Reviews, and individual client testimonials.

---

## 3. TinaCMS Navigation Layout

When logging into `/admin`, the sidebar is cleanly structured to reflect the site's pages:

```
TinaCMS Admin Dashboard
│
├── 📄 Front Page          -> src/data/home.json
├── 📄 About Andrea         -> src/data/about.json
├── 📄 Services             -> src/data/services.json
├── 📄 Free Resources       -> src/data/resources.json
├── 📄 Contact              -> src/data/contact.json
├── 📝 Blog                 -> src/content/blog/*.md
└── ⭐ Reviews              -> src/data/reviews.json
```

---

## 4. Safety & Reversibility Controls

1. **Zero Risk to Production**:
   - All code is committed to `feat/full-site-cms-editing` and pushed to GitHub.
   - `main` has not been altered.
2. **Instant Reversibility**:
   - To discard or switch back at any time:
     ```bash
     git checkout main
     ```
3. **Merging to Production**:
   - When ready to publish to the live site:
     ```bash
     git checkout main
     git merge feat/full-site-cms-editing
     git push origin main
     ```
   - Hostinger will automatically build and deploy the updated CMS and static site.
