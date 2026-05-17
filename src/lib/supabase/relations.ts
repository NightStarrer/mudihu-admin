export function getJoinedCompanyName(client: unknown): string {
  if (!client) return "—";
  if (Array.isArray(client)) {
    const first = client[0] as { company_name?: string } | undefined;
    return first?.company_name ?? "—";
  }
  if (typeof client === "object" && client !== null && "company_name" in client) {
    return String((client as { company_name: string }).company_name);
  }
  return "—";
}
