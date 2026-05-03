import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  // Public routes - always accessible
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname)

  if (isPublicRoute) {
    // If logged in and trying to access login/register, redirect to dashboard
    if (isLoggedIn && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
      const role = session?.user?.role
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
      if (role === 'MANAJER') return NextResponse.redirect(new URL('/manajer/dashboard', nextUrl))
      return NextResponse.redirect(new URL('/customer/dashboard', nextUrl))
    }
    return NextResponse.next()
  }

  // Protected routes - require auth
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  const role = session?.user?.role

  // Admin routes
  if (nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Manajer routes
  if (nextUrl.pathname.startsWith('/manajer') && role !== 'MANAJER') {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Customer routes
  if (nextUrl.pathname.startsWith('/customer') && role !== 'CUSTOMER') {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
