# Nanda Kumar R — Portfolio
# Next.js 16 · React 19 · Apple Liquid Glass · TypeScript

Personal portfolio of **Nanda Kumar R** — Full Stack Developer based in Chennai, Tamil Nadu 🇮🇳

🔗 **GitHub:** [github.com/NandaKumar876](https://github.com/NandaKumar876)
🔗 **LinkedIn:** [linkedin.com/in/nanda-kumar-r-608036362](https://www.linkedin.com/in/nanda-kumar-r-608036362/)
📧 **Email:** nandakumarr3030@gmail.com

---

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:4000
npm run build
npm run start      # → http://localhost:4000
```

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Admin Dashboard
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-password
ADMIN_SESSION_SECRET=a-long-random-string

# GitHub Integration (for heatmap & activity feed)
GITHUB_USERNAME=NandaKumar876
GITHUB_TOKEN=github_pat_your_token_here

# Redis (for content persistence)
REDIS_URL=redis://default:your-password@your-host:6379

# Optional — Email notifications for contact form
SMTP_HOST=smtp.gmail.com
SMTP_USER=nandakumarr3030@gmail.com
SMTP_PASS=your-app-password
NOTIFY_EMAIL=nandakumarr3030@gmail.com
```

> **Note:** `.env.local` is gitignored and never pushed to GitHub.

---

## Pages

| Route | Type | Description |
|-------|------|-------------|
| `/` | Server | Hero — identity card, GitHub heatmap, featured work |
| `/about` | Server | Profile summary, stack, experience & education |
| `/work` | Server + Client | Projects with live tag filter |
| `/work/[slug]` | Server (SSG) | Project detail with feature highlights |
| `/services` | Server | Services & engagement types |
| `/certificates` | Server | Uploaded certificates |
| `/resume` | Server | Printable resume page + PDF download |
| `/contact` | Server + Client | Glass contact form with Redis inbox |
| `/dashboard-nanda7` | Protected | Admin console — edit profile, upload resume, manage certs |
| `/dashboard-nanda7/login` | Public | Admin login page |

---

# Architecture

```
nanda-portfolio/
├── app/
│   ├── layout.tsx                  # Root — Nav, fonts, footer
│   ├── globals.css                 # Full Liquid Glass design system
│   ├── page.tsx                    # Hero
│   ├── about/page.tsx              # About
│   ├── services/page.tsx           # Services
│   ├── work/
│   │   ├── page.tsx                # Projects list
│   │   └── [slug]/page.tsx         # SSG detail pages
│   ├── resume/page.tsx             # Resume
│   ├── certificates/page.tsx       # Certificates
│   ├── contact/page.tsx            # Contact form
│   ├── dashboard-nanda7/           # Protected admin dashboard
│   │   ├── page.tsx
│   │   └── login/page.tsx
│   └── api/
│       ├── admin/                  # Login / logout / content / upload routes
│       └── resume/route.ts         # PDF download endpoint
│
├── components/
│   ├── LiquidGlass.tsx             # Polymorphic glass — mouse shimmer
│   ├── Nav.tsx                     # Active-link nav
│   ├── AdminDashboard.tsx          # Admin UI
│   ├── CommandPalette.tsx          # ⌘K command palette
│   └── ContactForm.tsx             # Contact form
│
├── lib/
│   ├── portfolio.ts                # Redis-backed profile/resume/certs
│   ├── github.ts                   # GitHub heatmap & activity feed
│   ├── admin-auth.ts               # Admin session auth helper
│   └── admin-session.ts            # Signed session cookies
│
├── data/
│   ├── projects.ts                 # Project data
│   └── services.ts                 # Services data
│
├── proxy.ts                        # Next.js middleware — admin route guard
└── .env.example                    # Environment variable template
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

## Backend — Redis Content Store

All editable content is stored in Redis and managed via the admin dashboard:

1. `lib/portfolio.ts` — loads and saves profile, resume, certificates
2. `lib/contacts.ts` — stores contact form inbox submissions
3. `proxy.ts` — middleware that guards all `/dashboard-nanda7/*` routes with signed session cookies
4. Without a Redis URL the site falls back to static default data gracefully

---

## Customise

| What | Where |
|------|-------|
| Personal details | `lib/portfolio.ts` → `DEFAULT_PORTFOLIO` |
| Projects | `data/projects.ts` |
| Services | `data/services.ts` |
| Experience / Education | Admin dashboard or `lib/portfolio.ts` |
| Glass intensity | `<LiquidGlass intensity="low|medium|high">` |
| Dev port | `package.json` → `"dev": "next dev -p 4000"` |

---

## Deployment

Deploy this project on Vercel or any other hosting platform that supports Next.js.

Built with ❤️ using Next.js.
Design inspired by Apple Liquid Glass.

