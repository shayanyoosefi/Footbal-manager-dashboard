"use client";

import { useTransition } from "react";
import { saveCustomQuestionTemplate } from "@/lib/actions/questions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function SaveCustomTemplateForm() {
  const [pending, startTransition] = useTransition();

  return (
    <Card>
      <h2 className="font-semibold mb-2 text-sm">Save a reusable custom template</h2>
      <p className="text-xs text-muted mb-4">
        Templates appear in the predefined dropdown for quick reuse
      </p>
      <form
        action={(fd) => {
          startTransition(() => {
            void saveCustomQuestionTemplate(fd);
          });
        }}
        className="flex flex-wrap gap-3"
      >
        <Textarea name="text" placeholder="Template question" className="min-h-[80px] flex-1 min-w-[240px]" required />
        <Input name="category" placeholder="Category" className="w-40" />
        <Button type="submit" variant="secondary" disabled={pending} className="self-end">
          Save template
        </Button>
      </form>
    </Card>
  );
}
