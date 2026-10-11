export function formatVisitorLabel(visitors: number | null | undefined) {
  if (!Number.isFinite(visitors) || visitors == null || visitors < 0) return null;

  const formatted = new Intl.NumberFormat('en-US').format(visitors);
  return visitors === 1 ? `${formatted} unique visitor` : `${formatted} unique visitors`;
}
