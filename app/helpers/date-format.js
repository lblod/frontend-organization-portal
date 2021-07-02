import { helper } from '@ember/component/helper';

export default helper(function DateFormat([date]) {
  return new Intl.DateTimeFormat('nl-BE').format(date);
});
