export function displayValue(value: string | false | null | undefined) {
  if (value === false || value === null || value === undefined || value === "") {
    return "-";
  }
  return value;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH").format(value);
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
