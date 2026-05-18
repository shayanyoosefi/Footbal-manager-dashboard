import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getOptionLabel } from "@/lib/questions";

export default async function CoachResponsesPage() {
  const session = await requireRole(Role.COACH, Role.ADMIN);
  const coachId = session.user.role === Role.COACH ? session.user.id : undefined;

  const assignments = await prisma.questionAssignment.findMany({
    where: coachId ? { coachId } : {},
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
        <h1 className="font-display text-2xl font-bold tracking-wide">Player responses</h1>
        <p className="text-muted mt-1">Review multiple-choice answers from your squad</p>
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card>
            <p className="text-muted">No questions assigned yet.</p>
          </Card>
        ) : (
          assignments.map((a) => (
            <Card key={a.id} className="space-y-3">
              <div>
                <p className="font-medium">{a.player.user.name}</p>
                <p className="text-sm text-muted mt-1">{a.question.text}</p>
              </div>
              {a.answer ? (
                <div className="rounded-xl bg-background border border-card-border p-4 text-sm">
                  <span className="font-display font-semibold text-accent">
                    {getOptionLabel(a.answer.selectedOption)}
                  </span>{" "}
                  — {a.answer.text}
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
