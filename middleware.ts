import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Block admin routes in production
  if (process.env.NODE_ENV === "production") {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
