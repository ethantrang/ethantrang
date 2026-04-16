import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { LoginForm } from "./login-form";
import { AdminDashboard } from "./admin-dashboard";

function verifySession(cookie: string): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const dotIndex = cookie.lastIndexOf(".");
  if (dotIndex === -1) return false;
  const token = cookie.substring(0, dotIndex);
  const sig = cookie.substring(dotIndex + 1);
  const expected = createHmac("sha256", secret).update(token).digest("hex");
  return sig === expected;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  const isAuthenticated = session ? verifySession(session.value) : false;

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <AdminDashboard />;
}
