"use client";

import { useTransition } from "react";
import { deleteUser } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";

export function DeleteUserButton({ userId, email }: { userId: string; email: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete ${email}?`)) return;
        startTransition(() => {
          void deleteUser(userId);
        });
      }}
    >
      Delete
    </Button>
  );
}
