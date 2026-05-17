import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { AssignQuestionsForm } from "@/components/manager/assign-questions-form";
import { SaveCustomTemplateForm } from "@/components/manager/save-custom-template-form";

export default async function ManagerQuestionsPage() {
  const session = await requireRole(Role.MANAGER, Role.ADMIN);
  const effectiveManagerId =
    session.user.role === Role.MANAGER ? session.user.id : undefined;

  const [players, questions] = await Promise.all([
    prisma.playerProfile.findMany({
      where: effectiveManagerId ? { managerId: effectiveManagerId } : {},
      include: { user: { select: { name: true } } },
    }),
    prisma.questionTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { category: "asc" }],
    }),
  ]);

  const playerOptions = players.map((p) => ({
    id: p.id,
    name: p.user.name,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ask questions</h1>
        <p className="text-muted mt-1">
          Send predefined academy questions or write custom ones for your players
        </p>
      </div>

      {session.user.role === Role.MANAGER && <SaveCustomTemplateForm />}

      <AssignQuestionsForm
        players={playerOptions}
        questions={questions.map((q) => ({
          id: q.id,
          text: q.text,
          category: q.category,
          type: q.type,
        }))}
      />
    </div>
  );
}
