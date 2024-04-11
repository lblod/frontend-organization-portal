import { helper } from '@ember/component/helper';

export default helper(function DateFormat([date]) {
  const parsedDate = date instanceof Date ? date : new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return '';
  } else {
    const formatter = new Intl.DateTimeFormat('nl-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const formattedDate = formatter.format(parsedDate);
    const [day, month, year] = formattedDate.split('/'); // Split by '/' to get day, month, and year

    return `${day}-${month}-${year}`; // Use '-' as the separator
  }
});
