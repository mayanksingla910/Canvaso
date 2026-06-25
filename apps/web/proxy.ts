import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = getSessionCookie(request);

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isRoot = pathname === "/";

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAuthPage || isRoot) {
    return NextResponse.next();
  }

  const isBoardPage = /^\/[^/]+$/.test(pathname) && !pathname.startsWith("/api");
  if (isBoardPage) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};