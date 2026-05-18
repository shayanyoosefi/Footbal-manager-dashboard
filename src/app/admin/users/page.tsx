import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateUserForm } from "@/components/admin/create-user-form";
import { DeleteUserButton } from "@/components/admin/delete-user-button";
export default async function AdminUsersPage() {
  const [users, coaches] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        playerProfile: { include: { coach: { select: { name: true } } } },
      },
    }),
    prisma.user.findMany({
      where: { role: Role.COACH },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide">Users</h1>
        <p className="text-muted mt-1">Create and manage coaches, players, and admins</p>
      </div>

      <CreateUserForm coaches={coaches} />

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border text-left text-muted">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Details</th>
                <th className="px-6 py-3 font-medium w-24" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-card-border/50 last:border-0">
                  <td className="px-6 py-4 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-muted">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant="muted">
                      {user.role === Role.COACH ? "Coach" : user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted text-xs">
                    {user.playerProfile
                      ? `${user.playerProfile.position ?? "—"} · Squad ${user.playerProfile.squad ?? "—"} · Coach: ${user.playerProfile.coach.name}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <DeleteUserButton userId={user.id} email={user.email} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
