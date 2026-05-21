import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'nanda_admin_session'

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/dashboard-nanda7/login', request.url), 303)
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  })
  return response
}
