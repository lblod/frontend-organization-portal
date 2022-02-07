import { assert } from '@ember/debug';

function isDateInTheFuture(date) {
  assert('endDate should be a Date instance', date instanceof Date);
  let today = new Date();
  return date - today >= 0;
}
export function isActivePosition(endDate) {
  if (!endDate) {
    // No end date set, so the position is still active
    return true;
  } else {
    return isDateInTheFuture(endDate);
  }
}
