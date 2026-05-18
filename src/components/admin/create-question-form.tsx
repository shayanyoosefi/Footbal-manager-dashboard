"use client";

import { useTransition } from "react";
import { createPredefinedQuestion } from "@/lib/actions/questions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuestionOptionsFields } from "@/components/ui/question-options-fields";

export function CreateQuestionForm() {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <h2 className="font-display font-semibold mb-1">Add predefined question</h2>
      <p className="text-xs text-muted mb-4">Players choose one of four options (A–D)</p>
      <form
        action={(fd) => {
          startTransition(() => {
            void createPredefinedQuestion(fd);
          });
        }}
        className="space-y-4"
      >
        <Textarea name="text" placeholder="Question text" required minLength={5} />
        <Input name="category" placeholder="Category (e.g. Wellbeing)" />
        <QuestionOptionsFields />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add question"}
        </Button>
      </form>
    </Card>
  );
}
