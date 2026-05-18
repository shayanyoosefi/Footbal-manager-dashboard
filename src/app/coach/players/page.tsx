import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreatePlayerForm } from "@/components/coach/create-player-form";

export default async function CoachPlayersPage() {
  const session = await requireRole(Role.COACH, Role.ADMIN);
  const coachId = session.user.role === Role.COACH ? session.user.id : undefined;

  const players = await prisma.playerProfile.findMany({
    where: coachId ? { coachId } : undefined,
    include: {
      user: true,
      assignments: { select: { status: true } },
    },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide">Players</h1>
        <p className="text-muted mt-1">Manage your academy squad</p>
      </div>

      <CreatePlayerForm />

      <div className="grid gap-4">
        {players.length === 0 ? (
          <Card>
            <p className="text-muted">No players yet. Add your first player above.</p>
          </Card>
        ) : (
          players.map((p) => {
            const pending = p.assignments.filter((a) => a.status === "PENDING").length;
            return (
              <Card key={p.id} className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">{p.user.name}</p>
                  <p className="text-sm text-muted">{p.user.email}</p>
                  <p className="text-xs text-muted mt-1">
                    {p.position ?? "—"} · Squad {p.squad ?? "—"}
                    {p.jerseyNo ? ` · #${p.jerseyNo}` : ""}
                  </p>
                </div>
                <Badge variant={pending > 0 ? "warning" : "success"}>
                  {pending > 0 ? `${pending} pending` : "Up to date"}
                </Badge>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
