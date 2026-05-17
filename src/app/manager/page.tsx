import { Role, AssignmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ManagerOverviewPage() {
  const session = await requireRole(Role.MANAGER, Role.ADMIN);
  const managerId =
    session.user.role === Role.ADMIN
      ? undefined
      : session.user.id;

  const [playerCount, pending, answered] = await Promise.all([
    prisma.playerProfile.count({
      where: managerId ? { managerId } : undefined,
    }),
    prisma.questionAssignment.count({
      where: {
        ...(managerId ? { managerId } : {}),
        status: AssignmentStatus.PENDING,
      },
    }),
    prisma.questionAssignment.count({
      where: {
        ...(managerId ? { managerId } : {}),
        status: AssignmentStatus.ANSWERED,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manager dashboard</h1>
        <p className="text-muted mt-1">Your squad at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-3xl font-bold">{playerCount}</p>
          <p className="text-sm text-muted">Players in squad</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-warning">{pending}</p>
          <p className="text-sm text-muted">Awaiting answers</p>
        </Card>
        <Card>
          <p className="text-3xl font-bold text-accent">{answered}</p>
          <p className="text-sm text-muted">Answered</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/manager/players">
          <Button variant="secondary">Manage players</Button>
        </Link>
        <Link href="/manager/questions">
          <Button>Ask a question</Button>
        </Link>
        <Link href="/manager/responses">
          <Button variant="ghost">View responses</Button>
        </Link>
      </div>
    </div>
  );
}
