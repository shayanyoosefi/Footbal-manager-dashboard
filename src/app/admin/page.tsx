import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Users, MessageSquare, ClipboardList } from "lucide-react";

export default async function AdminOverviewPage() {
  const [users, questions, assignments] = await Promise.all([
    prisma.user.count(),
    prisma.questionTemplate.count({ where: { isActive: true } }),
    prisma.questionAssignment.count(),
  ]);

  const stats = [
    { label: "Total users", value: users, icon: Users },
    { label: "Question templates", value: questions, icon: MessageSquare },
    { label: "Assignments sent", value: assignments, icon: ClipboardList },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin overview</h1>
        <p className="text-muted mt-1">Manage your football academy platform</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="flex items-start gap-4">
            <span className="rounded-xl bg-pitch/50 p-3 text-accent">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm text-muted">{label}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
