export function isEmptyPeriod(period) {
  return !period?.startDate && !period?.endDate;
}
