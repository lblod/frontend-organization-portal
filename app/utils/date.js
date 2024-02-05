import { assert } from '@ember/debug';

export function inPeriod(date, start, end) {
  assert(
    'All parameters must be valid Date objects.',
    date instanceof Date && start instanceof Date && end instanceof Date
  );
  assert('Start date must be before end date.', start < end);

  return start < date && date < end;
}
