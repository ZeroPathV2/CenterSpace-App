import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login' || pathname === '/register'

  const isLoggedIn = !!token // just check if the cookie exists

  // Block non-authenticated users from protected pages
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Prevent logged-in users from accessing login/register
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico).*)'],
}