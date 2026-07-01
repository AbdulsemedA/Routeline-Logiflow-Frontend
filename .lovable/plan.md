## Goal
Add a stunning public landing page at `/` plus proper site-wide branding (logo, favicon, head metadata) — keeping the existing Routeline theme and color tokens.

## Changes

### 1. New landing route (`/`)
- Move current redirect logic from `src/routes/index.tsx` → new `src/routes/app.tsx` (or handle redirect only when user is already logged in, via a subtle "Go to dashboard" CTA instead of auto-redirect).
- Rebuild `src/routes/index.tsx` as a full marketing landing page using existing semantic tokens (`bg-background`, `bg-sidebar`, `text-primary`, chart colors) — no hardcoded colors.

**Sections:**
1. **Sticky top header** — Routeline logo + wordmark, nav (Features, How it works, Analytics, Pricing anchors), theme toggle, "Sign in" ghost button, "Get started" primary button.
2. **Hero** — Big headline ("Real-time dispatch for fleets that don't stop."), subcopy, dual CTAs, trust stats row (12k+ routes, 98.7% on-time, <3s dispatch), decorative mock dashboard card (map + dispatch panel preview) with subtle gradient glow using primary token.
3. **Live logos strip** — fake partner logos as monochrome text (uses muted-foreground).
4. **Features grid** (6 cards) — Live map, Smart dispatch, Driver ranking, Analytics, Realtime tracking, Role-based access. Lucide icons, card tokens.
5. **How it works** — 3-step timeline (Order → AI Assign → Track & Deliver).
6. **Product preview split** — screenshot-style mock of admin dashboard side, copy on the other.
7. **Role callouts** — 3 cards: Admins / Drivers / Customers with mini feature bullets and links to `/login`.
8. **Analytics teaser** — small recharts area chart using chart tokens.
9. **CTA banner** — gradient panel using `--primary` / sidebar tokens, "Start dispatching in minutes".
10. **Footer** — logo, columns (Product, Company, Legal), copyright, socials.

**Design polish:**
- Subtle grid/dot background pattern via CSS radial-gradient using border token.
- Glow accents via `color-mix` on primary.
- Framer-motion-light entrance animations (fade+translate) using CSS only (no new dep).
- Fully responsive; mobile menu via existing Sheet component.

### 2. Logo asset
- Generate a transparent PNG brand mark (Routeline radar/route glyph) at `src/assets/routeline-logo.png` using imagegen (premium, transparent bg).
- Create a tiny `Logo` component (`src/components/brand/Logo.tsx`) rendering icon + "Routeline" wordmark, reused in header, footer, sidebar, login.

### 3. Favicon
- Save the same mark as `public/favicon.png`.
- Delete default `public/favicon.ico`.
- Register in `src/routes/__root.tsx` `head().links`.

### 4. Head metadata
- `__root.tsx`: replace placeholder "Lovable App"/"Lovable Generated Project" with real defaults:
  - title: "Routeline — Smart Logistics & Dispatch Platform"
  - description: "Real-time dispatch, live fleet map, and AI-powered driver assignment for modern logistics teams."
  - og:site_name, og:type=website, twitter:card=summary_large_image, author, theme-color.
  - Keep favicon link.
- `index.tsx` (landing) leaf-level `head()`: page-specific title/description, `og:title`, `og:description`, `og:url` (`/`), canonical `/`, plus Organization JSON-LD.
- `login.tsx` / `register.tsx`: distinct titles ("Sign in — Routeline", "Create account — Routeline").
- Skip `og:image` for now (no absolute URL available; hosting injects screenshot).

### 5. Auth redirect adjustment
- On `/`, if user is authenticated, show a small "Continue to dashboard →" pill in the header instead of auto-redirecting, so the landing page is always viewable.

## Out of scope
- Pricing page content (anchor only).
- Blog/docs routes.
- Real og:image generation (can add later once domain is set).

## Files touched
- `src/routes/index.tsx` (rewrite)
- `src/routes/__root.tsx` (metadata + favicon link)
- `src/routes/login.tsx`, `src/routes/register.tsx` (head + Logo)
- `src/components/brand/Logo.tsx` (new)
- `src/components/layout/Sidebar.tsx` (swap to Logo)
- `src/assets/routeline-logo.png` (new, generated)
- `public/favicon.png` (new), remove `public/favicon.ico`
