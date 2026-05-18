export function isAnswered(assignment: { answer: unknown | null }): boolean {
  return assignment.answer != null;
}
