"use client";

import { useState, useTransition } from "react";
import { Role } from "@prisma/client";
import { createUser } from "@/lib/actions/users";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CreateUserForm({
  coaches,
}: {
  coaches: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [role, setRole] = useState<Role>(Role.PLAYER);
  const [message, setMessage] = useState("");

  function handleSubmit(formData: FormData) {
    setMessage("");
    startTransition(async () => {
      const result = await createUser(formData);
      if (result && "error" in result && result.error) {
        setMessage("Check form fields and try again");
        return;
      }
      setMessage("User created successfully");
      (document.getElementById("create-user-form") as HTMLFormElement)?.reset();
    });
  }

  return (
    <Card>
      <h2 className="font-display font-semibold mb-4">Add user</h2>
      <form id="create-user-form" action={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <Input name="name" placeholder="Full name" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Password (min 8)" required minLength={8} />
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm"
        >
          {Object.values(Role).map((r) => (
            <option key={r} value={r}>
              {r === Role.COACH ? "COACH" : r}
            </option>
          ))}
        </select>
        {role === Role.PLAYER && (
          <>
            <select
              name="coachId"
              required
              className="rounded-xl border border-card-border bg-background px-4 py-2.5 text-sm sm:col-span-2"
            >
              <option value="">Select coach</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Input name="position" placeholder="Position (e.g. Forward)" />
            <Input name="squad" placeholder="Squad (e.g. U18)" />
            <Input name="jerseyNo" type="number" placeholder="Jersey number" min={1} max={99} />
          </>
        )}
        <div className="sm:col-span-2 flex items-center gap-4">
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create user"}
          </Button>
          {message && <p className="text-sm text-accent">{message}</p>}
        </div>
      </form>
    </Card>
  );
}
