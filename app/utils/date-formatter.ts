export function dateFormatter(
  date?: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
): string {
  if (!date) return ""
  return new Intl.DateTimeFormat("en-US", options).format(new Date(date))
}
