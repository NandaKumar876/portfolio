# Thamo Portfolio
### Next.js 15 · React 19 · Apple Liquid Glass · TypeScript

---

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build
npm run start
```

---

## Pages

| Route | Type | Description |
|-------|------|-------------|
| `/` | Server | Hero — typewriter, CTA, skills |
| `/services` | Server | Services & expertise grid |
| `/work` | Server + Client island | Projects + live tag filter |
| `/work/[slug]` | Server (SSG) | Project detail with features |
| `/about` | Server | Timeline + stats |
| `/contact` | Server + Client | Glass form with Server Action |

---

## Architecture

```
next-portfolio/
├── app/
│   ├── layout.tsx          # Root — Nav, AmbientCanvas, fonts
│   ├── globals.css          # Full Liquid Glass design system
│   ├── page.tsx             # Hero
│   ├── services/page.tsx    # Services
│   ├── work/
│   │   ├── page.tsx         # Server shell
│   │   ├── WorkClient.tsx   # 'use client' island — filter state
│   │   └── [slug]/page.tsx  # SSG detail pages
│   ├── about/page.tsx       # About
│   └── contact/page.tsx     # Contact (uses ContactForm)
│
├── components/
│   ├── LiquidGlass.tsx      # Polymorphic glass — mouse shimmer
│   ├── Nav.tsx              # Active-link nav (usePathname)
│   ├── Typewriter.tsx       # Animated role typewriter
│   ├── AmbientCanvas.tsx    # Canvas blobs (glass needs backdrop)
│   └── ContactForm.tsx      # useActionState form
│
├── data/
│   ├── projects.ts          # All project data
│   └── services.ts          # Services data
│
└── lib/
    └── actions.ts           # submitContact Server Action (Zod + fs)
```

---

## Apple Liquid Glass — Physics

Five layers stacked in CSS:

```
① backdrop-filter: blur(60px) saturate(200%) brightness(1.18)
   → Frosted translucent base

② background: rgba(255,255,255, 0.068)
   → Glass body tint

③ border-top:  1px solid rgba(255,255,255, 0.34)   ← bright (lit face)
   border-bottom: 1px solid rgba(255,255,255, 0.05) ← dark (shadow face)
   → Directional specular borders

④ box-shadow: [8 layers]
   inset 0 1.5px 0 rgba(255,255,255, 0.44)  ← top specular rim
   inset 0 -1.5px 0 rgba(0,0,0, 0.30)       ← gravity shadow
   0 24px 64px rgba(0,0,0, 0.68)             ← outer depth
   → Multi-layer specular system

⑤ ::before { radial-gradient at var(--mx) var(--my) }
   LiquidGlass.tsx updates --mx/--my on mousemove
   → Real-time caustic shimmer (the key effect)

⑥ ::after { SVG feTurbulence grain }
   → Surface micro-texture
```

---

## Backend — Contact Server Action

`lib/actions.ts` uses Next.js 15 Server Actions:

1. Validates with **Zod** schema
2. Saves to **`data/contacts.json`**
3. Optional **nodemailer** email (uncomment block + set `.env`)

```bash
# .env.local
SMTP_HOST=smtp.gmail.com
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
NOTIFY_EMAIL=notify@you.com
```

---

## Customise

| What | Where |
|------|-------|
| Projects | `data/projects.ts` |
| Services | `data/services.ts` |
| Timeline / stats | `app/about/page.tsx` |
| Contact links | `app/contact/page.tsx` |
| Glass intensity | `<LiquidGlass intensity="low|medium|high">` |
| Skills list | `app/page.tsx` |
# Portfolio
