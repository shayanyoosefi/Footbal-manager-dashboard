import Link from "next/link";
import { Role } from "@prisma/client";
import { Shield, Users, MessageSquare, LayoutDashboard } from "lucide-react";
import { SignOutButton } from "@/components/layout/sign-out-button";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const navByRole: Record<Role, NavItem[]> = {
  [Role.ADMIN]: [
    { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { href: "/admin/questions", label: "Questions", icon: <MessageSquare className="h-4 w-4" /> },
    { href: "/manager", label: "Manager view", icon: <Shield className="h-4 w-4" /> },
  ],
  [Role.MANAGER]: [
    { href: "/manager", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/manager/players", label: "Players", icon: <Users className="h-4 w-4" /> },
    { href: "/manager/questions", label: "Ask questions", icon: <MessageSquare className="h-4 w-4" /> },
    { href: "/manager/responses", label: "Responses", icon: <Shield className="h-4 w-4" /> },
  ],
  [Role.PLAYER]: [
    { href: "/player", label: "My questions", icon: <MessageSquare className="h-4 w-4" /> },
  ],
};

export function DashboardShell({
  role,
  userName,
  children,
}: {
  role: Role;
  userName: string;
  children: React.ReactNode;
}) {
  const nav = navByRole[role];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-card-border bg-card/50 flex flex-col">
        <div className="p-6 border-b border-card-border">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pitch text-accent font-bold text-sm">
              FA
            </span>
            <div>
              <p className="font-semibold text-sm leading-tight">Academy Hub</p>
              <p className="text-xs text-muted capitalize">{role.toLowerCase()}</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:text-foreground hover:bg-background transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-card-border">
          <p className="text-xs text-muted truncate mb-2">{userName}</p>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8 max-w-6xl">{children}</main>
    </div>
  );
}
