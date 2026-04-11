import { NextRequest } from 'next/server'
import { verifyAdminSessionToken } from './admin-session'

const SESSION_COOKIE = 'thamo_admin_session'

export async function isAdminRequest(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'thamo-admin-session-secret'
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (!token) return false
  return verifyAdminSessionToken(token, secret)
}

