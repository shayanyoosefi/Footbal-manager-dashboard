import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateQuestionForm } from "@/components/admin/create-question-form";

export default async function AdminQuestionsPage() {
  const questions = await prisma.questionTemplate.findMany({
    orderBy: [{ type: "asc" }, { category: "asc" }],
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Question library</h1>
        <p className="text-muted mt-1">Predefined questions available to all managers</p>
      </div>

      <CreateQuestionForm />

      <div className="space-y-3">
        {questions.map((q) => (
          <Card key={q.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
            <div>
              <p className="font-medium">{q.text}</p>
              <p className="text-xs text-muted mt-1">
                {q.category ?? "General"}
                {q.author ? ` · by ${q.author.name}` : ""}
              </p>
            </div>
            <Badge variant={q.type === "PREDEFINED" ? "success" : "muted"}>{q.type}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
