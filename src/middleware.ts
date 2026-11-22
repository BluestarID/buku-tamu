import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || "buku-tamu-secret-key-super-secure-32chars",
  });

  const { pathname } = req.nextUrl;

  // If user is logged in and visits login page, redirect to /form-tamu
  if (pathname === "/login") {
    if (token) {
      return NextResponse.redirect(new URL("/form-tamu", req.url));
    }
    return NextResponse.next();
  }

  // If user visits root '/', redirect to /form-tamu if logged in, or /login if not
  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/form-tamu", req.url));
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Protect app routes: /form-tamu, /jadwal-tamu, /semua-tamu
  if (
    pathname.startsWith("/form-tamu") ||
    pathname.startsWith("/jadwal-tamu") ||
    pathname.startsWith("/semua-tamu")
  ) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/form-tamu/:path*",
    "/jadwal-tamu/:path*",
    "/semua-tamu/:path*",
  ],
};
