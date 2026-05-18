"use client";

import { useTransition } from "react";
import { saveCustomQuestionTemplate } from "@/lib/actions/questions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { QuestionOptionsFields } from "@/components/ui/question-options-fields";

export function SaveCustomTemplateForm() {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <h2 className="font-display font-semibold mb-2 text-sm">Save reusable template</h2>
      <p className="text-xs text-muted mb-4">4-option questions for quick reuse</p>
      <form
        action={(fd) => {
          startTransition(() => {
            void saveCustomQuestionTemplate(fd);
          });
        }}
        className="space-y-4"
      >
        <Textarea name="text" placeholder="Question" className="min-h-[80px]" required />
        <Input name="category" placeholder="Category" className="max-w-xs" />
        <QuestionOptionsFields />
        <Button type="submit" variant="secondary" disabled={pending}>
          Save template
        </Button>
      </form>
    </Card>
  );
}
