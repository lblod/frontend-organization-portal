export function isEmptyPeriod(period) {
  return !period?.startDate && !period?.endDate;
}

/**
 * Whether two periods share at least a day. A missing start date means the
 * period has always been running, a missing end date that it still is, so a
 * period without dates overlaps with every period. The end date is inclusive:
 * a relation is still active on its end date.
 */
export function periodsOverlap(a, b) {
  return startsBeforeEnd(a, b) && startsBeforeEnd(b, a);
}

function startsBeforeEnd(a, b) {
  return !a?.startDate || !b?.endDate || a.startDate <= b.endDate;
}
