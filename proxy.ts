import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSessionToken } from '@/lib/admin-session'

const SESSION_COOKIE = 'thamo_admin_session'
const LOGIN_PATH = '/admin/login'
const LOGIN_API_PATH = '/api/admin/login'
const LOGOUT_API_PATH = '/api/admin/logout'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secret = process.env.ADMIN_SESSION_SECRET || 'thamo-admin-session-secret'

  const token = request.cookies.get(SESSION_COOKIE)?.value
  const isAuthed = token ? await verifyAdminSessionToken(token, secret) : false

  if (pathname === LOGIN_PATH) {
    if (isAuthed) {
      const nextPath = request.nextUrl.searchParams.get('next') || '/admin'
      const safeNext = nextPath.startsWith('/admin') && nextPath !== LOGIN_PATH ? nextPath : '/admin'
      return NextResponse.redirect(new URL(safeNext, request.url))
    }
    return NextResponse.next()
  }

  if (pathname === LOGIN_API_PATH || pathname === LOGOUT_API_PATH) {
    return NextResponse.next()
  }

  if (isAuthed) return NextResponse.next()

  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const loginUrl = new URL(LOGIN_PATH, request.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
