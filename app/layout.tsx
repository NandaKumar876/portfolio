import type { Metadata } from 'next'
import { Nav }           from '@/components/Nav'
import { AmbientCanvas } from '@/components/AmbientCanvas'
import '@/app/globals.css'

export const metadata: Metadata = {
  title:       'Thamo — Developer',
  description: 'Full Stack Developer building precise, performant digital products.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AmbientCanvas />
        <Nav />
        <main>{children}</main>
        <footer className="footer">
          Thamo &nbsp;·&nbsp; Next.js &nbsp;·&nbsp; Chennai, India &nbsp;·&nbsp; 2025
        </footer>
      </body>
    </html>
  )
}
