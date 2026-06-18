export function toDatetimeLocalValue(value: string | false | null | undefined) {
  if (!value) return "";
  return value.replace(" ", "T").slice(0, 16);
}

export function toApiDateTime(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatDateTime(value: string | false | null | undefined) {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16);
}
