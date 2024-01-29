export function inPeriod(date, start, end) {
  if (date && start && end) {
    let time = date.getTime();
    return start.getTime() < time && time < end.getTime();
  }
  return false;
}
