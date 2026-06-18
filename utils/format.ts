export function displayValue(value: string | false | null | undefined) {
  if (value === false || value === null || value === undefined || value === "") {
    return "-";
  }
  return value;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
}

export function formatReviewedBy(
  reviewedBy: { name: string } | string | false | null | undefined,
) {
  if (!reviewedBy) return "-";
  if (typeof reviewedBy === "object") return reviewedBy.name;
  return reviewedBy;
}

export function getDefaultPointBalance(
  points: { currency: { is_default: boolean }; balance: number }[],
) {
  const defaultPoint = points.find((point) => point.currency.is_default);
  return defaultPoint?.balance ?? points[0]?.balance ?? 0;
}

export function getDefaultCurrency(
  points: { currency: { is_default: boolean; id: number; name: string } }[],
) {
  return (
    points.find((point) => point.currency.is_default)?.currency ??
    points[0]?.currency ??
    null
  );
}

const POINT_SOURCE_LABELS: Record<string, string> = {
  admin: "แอดมิน",
  redeem_qr: "แลก QR",
  receipt: "ใบเสร็จ",
  member_reward: "รางวัลสมาชิก",
  redeem: "แลกคูปอง",
  point_redeem: "แลกด้วย Point",
};

const POINT_TYPE_LABELS: Record<string, string> = {
  earn: "เพิ่ม",
  spend: "ลด",
};

export function formatPointSource(kind: string) {
  return POINT_SOURCE_LABELS[kind] ?? kind;
}

export function formatPointType(type: string) {
  return POINT_TYPE_LABELS[type] ?? type;
}
