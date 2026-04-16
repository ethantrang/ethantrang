import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const encoder = new TextEncoder();

async function verifySession(cookie: string): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const dotIndex = cookie.lastIndexOf(".");
  if (dotIndex === -1) return false;
  const token = cookie.substring(0, dotIndex);
  const sig = cookie.substring(dotIndex + 1);

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(token));
  const expected = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return sig === expected;
}

export async function middleware(req: NextRequest) {
  const session = req.cookies.get("admin_session");
  const isAuthenticated = session ? await verifySession(session.value) : false;

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/edit/:path*", "/api/admin/files/:path*"],
};
