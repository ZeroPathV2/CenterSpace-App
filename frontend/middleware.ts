import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('connect.sid')?.value

  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login' || pathname === '/register'

  // If no session → block everything except login/register
  if (!sessionCookie && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If logged in → prevent access to login/register
  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
}