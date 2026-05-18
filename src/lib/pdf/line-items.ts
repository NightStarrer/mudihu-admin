/** How a proposal line item should read on PDFs (title + optional subtext). */
export function getLineItemDisplay(
  group: { title: string; description: string | null },
  options?: { proposalTitle?: string | null; phaseName?: string | null }
): { heading: string; subtext: string | null } {
  const title = group.title?.trim() ?? "";
  const desc = group.description?.trim() ?? "";
  const proposalTitle = options?.proposalTitle?.trim() ?? "";
  const phaseName = options?.phaseName?.trim() ?? "";

  // Common pattern: "Service name - scope details…"
  const dashMatch = desc.match(/^(.+?)\s+[-–—]\s+([\s\S]+)$/);

  if (dashMatch) {
    const itemName = dashMatch[1].trim();
    const itemDetails = dashMatch[2].trim();

    const titleLooksGeneric =
      !title ||
      (proposalTitle && title === proposalTitle) ||
      (phaseName && title === phaseName) ||
      title !== itemName;

    if (titleLooksGeneric) {
      return {
        heading: itemName,
        subtext: itemDetails || null,
      };
    }

    return {
      heading: title,
      subtext: itemDetails || null,
    };
  }

  if (desc && desc !== title) {
    return {
      heading: title || desc,
      subtext: title ? desc : null,
    };
  }

  return {
    heading: title || desc || "—",
    subtext: null,
  };
}
