import type { Metadata } from 'next'
import Script                from 'next/script'
import { Sidebar }           from '@/components/Sidebar'
import { CommandPalette }    from '@/components/CommandPalette'
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts'
import { getProjects }       from '@/lib/projects'
import { getPortfolioData }  from '@/lib/portfolio'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Thamo — Developer',
  description: 'Portfolio of Thamothara Natarajan — Full Stack Developer in Chennai.',
}

/* On first ever visit, persist 'light' so the default sticks across reloads.
   Subsequent visits respect whatever the user explicitly toggled to. */
const THEME_INIT = `(function(){try{var s=localStorage.getItem('theme');var t=(s==='dark'||s==='light')?s:'light';if(!s){localStorage.setItem('theme','light');}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`

const REJECTION_GUARD = `window.addEventListener('unhandledrejection',function(event){if(event.reason&&(event.reason.message&&event.reason.message.includes('MetaMask')||event.reason.code===4001||String(event.reason).includes('MetaMask'))){event.preventDefault();}});`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [projects, content] = await Promise.all([
    getProjects().catch(() => []),
    getPortfolioData(),
  ])
  const projectLite = projects.map(p => ({ title: p.title, slug: p.slug, description: p.description }))
  const { profile } = content

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        {/* beforeInteractive scripts run before hydration — no FOUC, and they
            don't trip React 19's "script tag in component tree" error. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        <Script id="rejection-guard" strategy="beforeInteractive">
          {REJECTION_GUARD}
        </Script>

        <div className="shell">
          <Sidebar
            profile={{
              role:           profile.role,
              location:       profile.location,
              githubUrl:      profile.githubUrl,
              linkedinUrl:    profile.linkedinUrl,
              xUrl:           profile.xUrl,
              githubUsername: profile.githubUsername,
            }}
          />
          <div className="content">
            <main>{children}</main>
            <footer className="footer">
              <span>Thamo</span>
              <span className="footer-divider">·</span>
              <span>Chennai, India</span>
              <span className="footer-divider">·</span>
              <span>{new Date().getFullYear()}</span>
            </footer>
          </div>
        </div>

        <CommandPalette projects={projectLite} />
        <KeyboardShortcuts />
      </body>
    </html>
  )
}
