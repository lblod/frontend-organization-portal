// [table column, value of a row to sort on]
const SORT_VALUES = new Map([
  ['role.label', (row) => row.role],
  ['classification.label', (row) => row.organizationType],
  ['name', (row) => row.organizationName],
  ['start-date', (row) => row.startDate],
  ['end-date', (row) => row.endDate],
  ['relation-status', (row) => row.relationStatus.label],
]);

/**
 * Sort the rows of the related organizations table on a column, descending
 * when it starts with `-`. Rows without a value (no start or end date) come
 * last in both directions; ties are sorted by name.
 */
export function sortRelatedOrganizations(rows, sort) {
  const descending = sort.startsWith('-');
  const valueOf = SORT_VALUES.get(descending ? sort.slice(1) : sort);
  if (!valueOf) {
    return rows;
  }

  return [...rows].sort((a, b) => {
    const left = valueOf(a);
    const right = valueOf(b);
    if (left == null || right == null) {
      return (left == null) - (right == null) || byName(a, b);
    }
    const order =
      left instanceof Date ? left - right : left.localeCompare(right);
    return (descending ? -order : order) || byName(a, b);
  });
}

function byName(a, b) {
  return (a.organizationName ?? '').localeCompare(b.organizationName ?? '');
}
