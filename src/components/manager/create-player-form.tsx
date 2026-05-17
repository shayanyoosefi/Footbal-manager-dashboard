"use client";

import { useState, useTransition } from "react";
import { createPlayer } from "@/lib/actions/players";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CreatePlayerForm() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  return (
    <Card>
      <h2 className="font-semibold mb-4">Add player</h2>
      <form
        action={(fd) =>
          startTransition(async () => {
            const result = await createPlayer(fd);
            setMessage(result?.error ? "Could not create player" : "Player added");
          })
        }
        className="grid gap-4 sm:grid-cols-2"
      >
        <Input name="name" placeholder="Full name" required />
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Temporary password" required minLength={8} />
        <Input name="position" placeholder="Position" />
        <Input name="squad" placeholder="Squad" />
        <Input name="jerseyNo" type="number" placeholder="Jersey #" min={1} max={99} />
        <div className="sm:col-span-2 flex gap-4 items-center">
          <Button type="submit" disabled={pending}>
            {pending ? "Adding…" : "Add player"}
          </Button>
          {message && <p className="text-sm text-accent">{message}</p>}
        </div>
      </form>
    </Card>
  );
}
