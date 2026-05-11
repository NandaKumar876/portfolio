import type { Metadata } from 'next'
import { Nav }             from '@/components/Nav'
import { CommandPalette }  from '@/components/CommandPalette'
import { getProjects }     from '@/lib/projects'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Thamo — Developer',
  description: 'Editorial liquid-glass portfolio for Thamothara Natarajan — Full Stack Developer in Chennai.',
}

const THEME_INIT = `(function(){try{var s=localStorage.getItem('theme');var t=s||(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const projects = await getProjects().catch(() => [])
  const projectLite = projects.map(p => ({ title: p.title, slug: p.slug, description: p.description }))

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('unhandledrejection', function(event) {
            if (event.reason && (
              event.reason.message?.includes('MetaMask') ||
              event.reason.code === 4001 ||
              event.reason.toString().includes('MetaMask')
            )) { event.preventDefault(); }
          });
        `}} />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <CommandPalette projects={projectLite} />
        <footer className="footer">
          <span>Thamo</span>
          <span className="footer-divider">·</span>
          <span>Chennai, India</span>
          <span className="footer-divider">·</span>
          <span>{new Date().getFullYear()}</span>
        </footer>
      </body>
    </html>
  )
}
