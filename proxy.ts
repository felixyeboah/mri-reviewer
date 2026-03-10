import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  const { pathname } = request.nextUrl

  // Redirect authenticated users away from auth pages
  if (sessionCookie && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/reviews", request.url))
  }

  // Redirect unauthenticated users to login
  if (!sessionCookie && pathname.startsWith("/reviews")) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/reviews/:path*", "/auth/:path*"],
}
