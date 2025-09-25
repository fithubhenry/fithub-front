
import { NextRequest, NextResponse } from "next/server";

function decodeToken(token: string) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return payload;
  } catch {
    return null;
  }
}

const protectedRoutes = ["/dashboard", "/profile","/misTurnos"];
const adminRoutes = ["/admin", "/usuarios"];
const guestOnlyRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const decoded = token ? decodeToken(token) : null;

  if (protectedRoutes.some(route => pathname.startsWith(route)) && !decoded) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (guestOnlyRoutes.some(route => pathname.startsWith(route)) && decoded) {
    if (decoded.esAdmin) {
      return NextResponse.redirect(new URL("/admin/usuarios", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!decoded) return NextResponse.redirect(new URL("/", request.url));
    if (!decoded.esAdmin) return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

