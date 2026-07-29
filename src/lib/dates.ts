export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const trimmed = dateStr.trim();
  if (/^\d+$/.test(trimmed)) {
    const serial = Number(trimmed);
    if (serial > 60) {
      const date = new Date((serial - 25569) * 86400000);
      return date.toLocaleDateString("en-GB");
    }
    return trimmed;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-");
    return `${d}/${m}/${y}`;
  }
  return trimmed;
}

export function toInputDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();
  if (/^\d+$/.test(trimmed)) {
    const serial = Number(trimmed);
    if (serial > 60) {
      const date = new Date((serial - 25569) * 86400000);
      return date.toISOString().split("T")[0];
    }
    return trimmed;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}
