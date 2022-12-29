export function dashedDateFormat(date) {
  if (date) {
    const day = date.toLocaleDateString('en-US', { day: '2-digit' }),
      month = date.toLocaleDateString('en-US', { month: '2-digit' }),
      year = date.getFullYear();

    return day + '-' + month + '-' + year;
  } else {
    return '';
  }
}
