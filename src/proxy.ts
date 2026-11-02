import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const next = request.nextUrl.pathname;
    return NextResponse.redirect(
      new URL(`/sign-in?next=${encodeURIComponent(next)}`, request.url),
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sell/:path*",
    "/inbox/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/likes/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
