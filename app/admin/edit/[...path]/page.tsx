import { AdminDashboard } from "../../admin-dashboard";

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const filePath = path.join("/");
  return <AdminDashboard initialPath={filePath} />;
}
