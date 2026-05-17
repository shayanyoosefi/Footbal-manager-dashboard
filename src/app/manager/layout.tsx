import { Role } from "@prisma/client";
import { requireRole } from "@/lib/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(Role.MANAGER, Role.ADMIN);

  return (
    <DashboardShell role={Role.MANAGER} userName={session.user.name ?? session.user.email}>
      {children}
    </DashboardShell>
  );
}
