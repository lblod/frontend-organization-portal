import { helper } from '@ember/component/helper';

export default helper(function DateFormat([date]) {
  if (!(date instanceof Date)) {
    return '';
  } else {
    const day = date.toLocaleDateString('nl-BE', { day: '2-digit' }),
      month = date.toLocaleDateString('nl-BE', { month: '2-digit' }),
      year = date.getFullYear();

    return day + '-' + month + '-' + year;
  }
});
