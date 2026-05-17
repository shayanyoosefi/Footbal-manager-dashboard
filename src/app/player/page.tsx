import { AssignmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Role } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { AnswerForm } from "@/components/player/answer-form";

export default async function PlayerQuestionsPage() {
  const session = await requireRole(Role.PLAYER);

  const profile = await prisma.playerProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return (
      <Card>
        <p className="text-muted">Your player profile is not set up. Contact your coach.</p>
      </Card>
    );
  }

  const assignments = await prisma.questionAssignment.findMany({
    where: { playerId: profile.id },
    include: { question: true, answer: true, manager: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const pending = assignments.filter((a) => a.status === AssignmentStatus.PENDING);
  const answered = assignments.filter((a) => a.status === AssignmentStatus.ANSWERED);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My questions</h1>
        <p className="text-muted mt-1">Answer questions from your coach</p>
      </div>

      {pending.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-warning">Pending ({pending.length})</h2>
          {pending.map((a) => (
            <Card key={a.id} className="space-y-4">
              <div className="flex justify-between gap-2">
                <p className="font-medium">{a.question.text}</p>
                <Badge variant="warning">Pending</Badge>
              </div>
              <p className="text-xs text-muted">
                From {a.manager.name}
                {a.dueDate ? ` · Due ${formatDate(a.dueDate)}` : ""}
              </p>
              <AnswerForm assignmentId={a.id} />
            </Card>
          ))}
        </section>
      )}

      {answered.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-accent">Answered</h2>
          {answered.map((a) => (
            <Card key={a.id} className="space-y-3 opacity-90">
              <div className="flex justify-between gap-2">
                <p className="font-medium">{a.question.text}</p>
                <Badge variant="success">Answered</Badge>
              </div>
              {a.answer && (
                <div className="rounded-xl bg-background border border-card-border p-4 text-sm">
                  {a.answer.text}
                </div>
              )}
              <p className="text-xs text-muted">{formatDate(a.createdAt)}</p>
            </Card>
          ))}
        </section>
      )}

      {assignments.length === 0 && (
        <Card>
          <p className="text-muted">No questions right now. Check back after training.</p>
        </Card>
      )}
    </div>
  );
}
