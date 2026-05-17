import { Role, AssignmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default async function ManagerResponsesPage() {
  const session = await requireRole(Role.MANAGER, Role.ADMIN);
  const managerId =
    session.user.role === Role.MANAGER ? session.user.id : undefined;

  const assignments = await prisma.questionAssignment.findMany({
    where: managerId ? { managerId } : {},
    include: {
      player: { include: { user: { select: { name: true } } } },
      question: true,
      answer: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Player responses</h1>
        <p className="text-muted mt-1">Review answers from your squad</p>
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card>
            <p className="text-muted">No questions assigned yet.</p>
          </Card>
        ) : (
          assignments.map((a) => (
            <Card key={a.id} className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{a.player.user.name}</p>
                  <p className="text-sm text-muted mt-1">{a.question.text}</p>
                </div>
                <Badge variant={a.status === AssignmentStatus.ANSWERED ? "success" : "warning"}>
                  {a.status}
                </Badge>
              </div>
              {a.answer ? (
                <div className="rounded-xl bg-background border border-card-border p-4 text-sm">
                  {a.answer.text}
                  <p className="text-xs text-muted mt-2">Answered {formatDate(a.answer.updatedAt)}</p>
                </div>
              ) : (
                <p className="text-sm text-muted italic">Waiting for answer…</p>
              )}
              <p className="text-xs text-muted">Sent {formatDate(a.createdAt)}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
