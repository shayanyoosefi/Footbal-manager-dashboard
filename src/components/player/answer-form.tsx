"use client";

import { useTransition } from "react";
import { submitAnswer } from "@/lib/actions/questions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function AnswerForm({ assignmentId }: { assignmentId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        startTransition(() => {
          void submitAnswer(assignmentId, fd);
        });
      }}
      className="space-y-3"
    >
      <Textarea name="text" placeholder="Your answer…" required />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Submitting…" : "Submit answer"}
      </Button>
    </form>
  );
}
