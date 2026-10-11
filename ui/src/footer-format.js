export function formatVisitorLabel(visitors) {
  if (!Number.isFinite(visitors) || visitors < 0) return null;

  const formatted = new Intl.NumberFormat('en-US').format(visitors);
  return visitors === 1 ? `${formatted} visitor` : `${formatted} visitors`;
}
