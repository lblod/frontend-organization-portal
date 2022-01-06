import { helper } from '@ember/component/helper';

export default helper(function DateFormat([date]) {
  if (!(date instanceof Date)) {
    return '';
  }

  return new Intl.DateTimeFormat('nl-BE').format(date);
});
