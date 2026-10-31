# Tutorial: Your Personal Website (Beginner Guide)

This guide walks you through the website built in this project — from zero frontend experience to understanding every major piece. Read it in order the first time. Later, use it as a map when you want to change something.

---

## Table of contents

1. [What you built (in plain English)](#1-what-you-built-in-plain-english)
2. [Technology summary](#2-technology-summary)
3. [How to run the site](#3-how-to-run-the-site)
4. [Project map](#4-project-map)
5. [High-level walkthrough](#5-high-level-walkthrough)
6. [Detailed code review](#6-detailed-code-review)
7. [Improvements after the basics](#7-improvements-after-the-basics)
8. [Best tools for frontend prompts](#8-best-tools-for-frontend-prompts)
9. [Glossary](#9-glossary)

---

## 1. What you built (in plain English)

You now have a **personal portfolio website** for Giovanni Pizzighini that:

- Introduces you (hero + dossier card)
- Tells your story (About)
- Lists your career (Journey, with filters)
- Shows what you are good at (Capabilities)
- Reserves space for case studies (Portfolio)
- Lets visitors chat with a **Digital Twin** about your career (AI via OpenRouter)
- Offers clear contact paths (email + LinkedIn)

It runs **locally** with Next.js. Design direction: dark, modern, tech — with a cleaner, more standardized type system (display font for titles, body font for text, mono for small labels).

---

## 2. Technology summary

### The stack (what each piece does)

| Technology | Role | Beginner analogy |
|---|---|---|
| **HTML** | Structure of the page | The skeleton |
| **CSS** | Look and layout | Clothes and furniture arrangement |
| **JavaScript / TypeScript** | Behavior | The brain that reacts to clicks |
| **React** | UI building blocks called **components** | Lego bricks you reuse |
| **Next.js** | Framework around React | The house that includes routing, server, and tooling |
| **OpenRouter** | AI API gateway | A switchboard to many AI models with one key |

### Why Next.js?

Next.js (App Router) gives you:

1. **Pages from folders** — `app/page.tsx` is `/`, `app/portfolio/page.tsx` is `/portfolio`
2. **API routes** — `app/api/twin/route.ts` is `/api/twin` (server-side, good for secrets)
3. **Fonts** — Google fonts loaded efficiently via `next/font`
4. **Dev server** — `npm run dev` reloads as you edit

### Why TypeScript?

TypeScript is JavaScript with **types**. Types catch mistakes early (for example: a message must have a `role` of `"user"` or `"assistant"`). You do not need to master TypeScript on day one — treat types as labels that document intent.

### Client vs server (important mental model)

- **Server components** (default in `app/`): run on the server, good for static content and secrets.
- **Client components** (`"use client"` at the top): run in the browser, needed for clicks, forms, chat state, scroll listeners.

Examples in this project:

- `Hero.tsx` — mostly server-friendly content
- `Nav.tsx`, `Journey.tsx`, `TwinChat.tsx` — client, because they react to user input

### Secrets

Your OpenRouter key lives in `.env` as `OPENROUTER_API_KEY`.  
Next.js only exposes variables that start with `NEXT_PUBLIC_` to the browser. Your key does **not** start with that, so it stays on the server — which is correct. The twin chat UI calls `/api/twin`; the API route talks to OpenRouter.

Never commit `.env` to public git. This repo’s `.gitignore` already excludes it.

---

## 3. How to run the site

From the project folder (`website`):

```powershell
npm.cmd install
npm.cmd run dev
```

Then open [http://localhost:3000](http://localhost:3000).

> **Windows note:** If PowerShell blocks `npm`, use `npm.cmd` (as above), or set your user execution policy to `RemoteSigned` so `npm` works normally.

Useful scripts from `package.json`:

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (checks that the site compiles) |
| `npm run start` | Serve the production build |

---

## 4. Project map

```text
website/
├── app/
│   ├── layout.tsx          # Shell around every page (nav, fonts, footer)
│   ├── page.tsx            # Home page (/)
│   ├── globals.css         # All site styles
│   ├── not-found.tsx       # 404 page
│   ├── icon.svg            # Browser tab icon
│   ├── portfolio/
│   │   ├── page.tsx        # Portfolio archive
│   │   └── [slug]/page.tsx # One case study page
│   └── api/
│       └── twin/route.ts   # Digital Twin API
├── components/             # Reusable UI pieces
├── data/
│   └── profile.ts          # Your career content (edit here first)
├── lib/
│   └── twin.ts             # Twin system prompt + helpers
├── .env                    # Secrets (local only)
├── package.json            # Dependencies and scripts
├── next.config.ts          # Next.js config
├── tsconfig.json           # TypeScript config
└── tutorial.md             # This file
```

### Mental rule

- Change **facts about yourself** → `data/profile.ts`
- Change **layout / look** → `components/*` + `app/globals.css`
- Change **AI behavior** → `lib/twin.ts` (+ optionally `app/api/twin/route.ts`)

---

## 5. High-level walkthrough

### 5.1 The home page assembly line

`app/page.tsx` is like a packing list. It does not style much; it **composes** sections:

```tsx
<main id="main">
  <Hero />
  <Marquee />
  <About />
  <Journey />
  <Practice />
  <PortfolioPreview />
  <TwinChat />
  <Contact />
</main>
```

Each tag is a component. That is React’s core idea: break a big page into named parts.

### 5.2 The layout shell

`app/layout.tsx` wraps every page with:

- Fonts (Syne, Manrope, IBM Plex Mono)
- Global CSS
- Progress bar, grain overlay, spine label
- Navigation
- Footer
- SEO metadata (title, description)

If the home page is the “rooms,” layout is the “building frame.”

### 5.3 Content lives in one place

`data/profile.ts` holds:

- Name, role, email, LinkedIn
- Metrics and dossier rows
- Full experience list
- Capabilities, education, certifications
- Portfolio case study placeholders

Components **import** that data and render it. This avoids copy-pasting the same bio into ten files.

### 5.4 Routing

| URL | File |
|---|---|
| `/` | `app/page.tsx` |
| `/portfolio` | `app/portfolio/page.tsx` |
| `/portfolio/event-systems` | `app/portfolio/[slug]/page.tsx` |
| `/api/twin` | `app/api/twin/route.ts` |

`[slug]` means “dynamic segment.” The folder name in brackets becomes a parameter (`event-systems`, `cost-platforms`, …).

### 5.5 Digital Twin flow

```text
Visitor types a question in TwinChat (browser)
        │
        ▼
POST /api/twin  (your Next.js server)
        │
        ▼
OpenRouter → free model (Nemotron Ultra, with fallbacks)
        │
        ▼
JSON reply { reply, model }
        │
        ▼
TwinChat shows the answer
```

The model is instructed (via a **system prompt**) to answer as you, using only the dossier built from `data/profile.ts`.

---

## 6. Detailed code review

This section is the “open the hood” part. Skim first, then re-read the files in your editor.

### 6.1 `data/profile.ts` — your source of truth

Key ideas:

- Plain objects and arrays (easy to edit)
- TypeScript `type Role` describes the shape of a job entry
- `getCase(slug)` finds one portfolio item

**Beginner exercise:** Add a new certification string to the `certifications` array and refresh the site. You should see it under About without touching About’s layout code.

### 6.2 `app/layout.tsx` — global shell

Notable patterns:

```tsx
const syne = Syne({ variable: "--font-display", ... });
```

This loads a font and exposes a CSS variable. In `globals.css`:

```css
--display: var(--font-display), "Avenir Next", sans-serif;
```

Titles use `font-family: var(--display)`. Body text uses `var(--body)`. Labels use `var(--mono)`.

`metadata` helps search engines and browser tabs. `jsonLd` is structured data for “Person” (optional SEO polish).

### 6.3 `app/globals.css` — visual system

Instead of a CSS framework, this project uses hand-written CSS with:

- **Design tokens** at the top (`--bg`, `--acid`, `--text`, …)
- **Utility-ish classes** (`.wrap`, `.kicker`, `.btn`, `.section`)
- **Section styles** (`.hero`, `.about`, `.paper` for the Journey band)
- **Responsive rules** with `@media (min-width: …)`

Typography standard (after cleanup):

| Role | Font |
|---|---|
| Big titles / brand | Syne (`--display`) |
| Paragraphs / UI text | Manrope (`--body`) |
| Kickers, tags, dossier labels | IBM Plex Mono (`--mono`) |

Layout rule used in About: **stack blocks vertically** (title → quote → body) so text never fights for the same space.

### 6.4 Navigation — `components/Nav.tsx`

Client component because it needs:

- Scroll state (background when scrolled)
- Mobile menu open/close
- Which section is “active” via `IntersectionObserver`
- Special handling for Twin (scroll + open chat)

```tsx
"use client";
```

That first line is required for hooks like `useState` / `useEffect`.

### 6.5 Journey — `components/Journey.tsx`

Interactive filter tabs:

- `all` / `engineering` / `foundation`
- Filters the `roles` array from profile data
- Groups results into chapters: Now, Banco Itaú, Earlier career

This is a classic React pattern:

1. Store filter in state
2. Derive a visible list with `useMemo` / filter
3. Render the list

### 6.6 Reveal animations — `components/Reveal.tsx`

When a block scrolls into view, it fades/slides in. Implementation outline:

1. Attach a `ref` to a div
2. Observe it with `IntersectionObserver`
3. Add class `.in` when visible
4. Respect `prefers-reduced-motion`

If JavaScript is slow or reduced motion is on, content still shows.

### 6.7 Portfolio pages

- `CaseIndex` lists forthcoming studies
- `[slug]/page.tsx` uses `generateStaticParams()` so known slugs are prebuilt
- Unknown slug → `notFound()`

When you write a real case study later, expand the object in `cases` inside `data/profile.ts` (and eventually replace “in preparation” copy with full content).

### 6.8 Digital Twin — three files

#### A) `lib/twin.ts`

- `TWIN_MODELS` — free models in preference order  
  Primary: `nvidia/nemotron-3-ultra-550b-a55b:free`
- `buildTwinSystemPrompt()` — long instruction + your dossier
- `sanitizeMessages()` — cleans and truncates chat history before sending

#### B) `app/api/twin/route.ts`

- Reads JSON body `{ messages: [...] }`
- Builds system + user messages
- Calls OpenRouter with your server-side API key
- Tries models in order if one is rate-limited
- Returns `{ reply, model }`

Important: this is a **Route Handler**, not a React component. It exports `POST`.

#### C) `components/TwinChat.tsx`

- Section on the home page + floating **DT** button + chat panel
- Keeps messages in React state
- Sends history to `/api/twin`
- Shows errors if the API fails

**Security takeaway:** the browser never sees `OPENROUTER_API_KEY`.

### 6.9 Small supporting components

| File | Purpose |
|---|---|
| `Mark.tsx` | GP logo mark |
| `Grain.tsx` | Subtle film grain overlay |
| `Spine.tsx` | Vertical left label on large screens |
| `Progress.tsx` | Top scroll progress bar |
| `Marquee.tsx` | Scrolling tech keywords |
| `Footer.tsx` | Copyright + back to top |

You can ignore these on day one; they are polish.

---

## 7. Improvements after the basics

Once you are comfortable editing content and CSS, these upgrades add real professional value.

### Content and product

1. **Write real portfolio case studies** — replace “in preparation” with problem → approach → impact → tech.
2. **Add a photo / headshot** carefully (hero atmosphere, not a floating card unless you redesign intentionally).
3. **CV download** — host a PDF and add a button next to Contact.
4. **Analytics** — privacy-friendly (e.g. Plausible, or Vercel Analytics) to see what visitors read.
5. **Multilingual site** — you already speak EN/PT/ES/IT; Next.js i18n routing is a natural next step.

### Engineering quality

6. **Tests** — Playwright for “chat opens and returns text”; Vitest for `sanitizeMessages`.
7. **Rate limiting** on `/api/twin` — free OpenRouter tiers are capped; protect against abuse.
8. **Input moderation / length limits** — already partly done; add IP-based throttling if you deploy publicly.
9. **Error monitoring** — Sentry for production crashes.
10. **CI** — GitHub Actions that run `npm run build` on every push.

### Design system maturity

11. **Move CSS variables into a small design doc** (colors, type scale, spacing).
12. **Component library** — optional later (Radix + your styles, or shadcn/ui adapted to your look).
13. **Dark/light toggle** — only if you want it; current brand is dark-first.
14. **Accessibility audit** — keyboard paths, contrast, focus rings (you already have some focus styles).

### AI twin upgrades

15. **Streaming replies** — smoother UX when the model supports clean content streams.
16. **Retrieval** — store longer project notes and retrieve relevant chunks per question.
17. **Admin mode** — a private page to edit twin instructions without code.
18. **Conversation export** — “email me this chat” for recruiters.

### Deployment

19. **Deploy to Vercel** (natural fit for Next.js) or Netlify.
20. **Custom domain** — `giovannipizzighini.com` (or similar).
21. **Preview deployments** — every PR gets a temporary URL.

---

## 8. Best tools for frontend prompts

When you use Cursor (or any AI coding assistant) for frontend work, tools + prompt style matter as much as the model.

### A. Best tools to pair with AI prompts

| Tool | Why it helps frontend AI work |
|---|---|
| **Cursor** | Best-in-class for editing a real repo with context of your files |
| **Chrome DevTools** | Inspect layout, overlap, network calls (`/api/twin`) |
| **React DevTools** | See component state (filters, chat messages) |
| **Figma** (or Penpot) | Sketch layout before asking AI to code |
| **Excalidraw** | Quick wireframes for section order |
| **v0 by Vercel** | Generate UI ideas/React quickly, then adapt into your design system |
| **Storybook** | Isolate components once the site grows |
| **Lighthouse** (in Chrome) | Performance / a11y scores after changes |
| **axe DevTools** | Accessibility checks |
| **OpenRouter Playground** | Test twin prompts/models before changing code |
| **GitHub + Vercel** | Ship and preview safely |

### B. Prompt patterns that work well for frontend

Use prompts that include **goal, constraints, files, and acceptance checks**.

**Good example:**

> In `components/About.tsx` and `app/globals.css`, restack the About header so the title, pull quote, and body never sit in overlapping columns. Keep the existing dark theme and Syne/Manrope/mono fonts. Do not add new libraries. Show me the files you change.

**Weak example:**

> Make the About section nicer.

### C. What to paste into prompts

1. Screenshot of the bug (overlap, spacing)
2. The file path(s) you care about
3. Design constraints (“no purple gradients,” “no new cards in hero,” “keep acid green accent”)
4. Definition of done (“works on mobile 390px and desktop 1440px”)

### D. Recommended “frontend prompt toolkit” workflow

1. **Observe** — reproduce in the browser, screenshot.
2. **Locate** — ask: “Which files control this UI?”
3. **Change small** — one section at a time.
4. **Verify** — refresh, check mobile + desktop.
5. **Commit** — short message explaining *why*.

### E. Models / assistants for frontend coding (practical view)

Tools evolve quickly; judge by **repo editing quality**, not hype:

- **Cursor Agent** (what you are using): strongest for multi-file edits in this project
- **Claude / GPT-class models inside Cursor**: good at React + CSS reasoning
- **v0**: great for generating a starting UI, weaker at matching an existing custom CSS system unless you feed it your tokens/rules
- **OpenRouter free models**: good for your *site’s Digital Twin*, usually weaker than paid coding agents for large refactors

For **your twin**, keep using OpenRouter free models as configured.  
For **building the site**, keep using Cursor on the codebase.

### F. Starter prompts you can reuse

**Content update**

> Update `data/profile.ts` with this new job: … Keep types valid. Do not change styling.

**Visual bug**

> On desktop, section X overlaps Y. Inspect `components/X.tsx` and relevant CSS in `globals.css`. Fix without changing brand colors.

**New section**

> Add a Testimonials section above Contact. Match existing section patterns (kicker, h2, wrap). Mobile first. No new dependencies.

**Twin behavior**

> In `lib/twin.ts`, make the twin refuse salary negotiation specifics and redirect to email. Keep answers short.

---

## 9. Glossary

| Term | Meaning |
|---|---|
| **Component** | A reusable UI function that returns markup |
| **Props** | Inputs passed into a component |
| **State** | Data that can change over time in the browser |
| **Hook** | React function like `useState`, `useEffect` |
| **Route** | A URL path mapped to a page or API |
| **API** | Server endpoint your frontend can call |
| **CSS variable** | Reusable value like `--acid` |
| **Responsive** | Layout that adapts to screen size |
| **SSR / RSC** | Server-rendered React; default in Next App Router |
| **System prompt** | Hidden instructions that shape an AI’s behavior |
| **Env var** | Configuration/secret loaded from `.env` |

---

## Quick “I want to change X” cheat sheet

| I want to… | Start here |
|---|---|
| Update my job history | `data/profile.ts` → `roles` |
| Change colors | `app/globals.css` → `:root` |
| Change homepage section order | `app/page.tsx` |
| Edit twin personality | `lib/twin.ts` → `buildTwinSystemPrompt` |
| Switch AI model | `lib/twin.ts` → `TWIN_MODELS` |
| Fix nav links | `components/Nav.tsx` |
| Add a portfolio case | `data/profile.ts` → `cases` + write content in slug page later |
| Deploy | Vercel + connect this repo + set `OPENROUTER_API_KEY` in project settings |

---

## Closing

You do not need to memorize everything. The productive path for a beginner is:

1. Run the site  
2. Change one fact in `data/profile.ts`  
3. Change one color in `globals.css`  
4. Ask the twin a question  
5. Come back to this tutorial when something feels mysterious  

That loop — **edit → refresh → understand** — is how frontend skill actually forms.
