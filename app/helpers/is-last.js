import { helper } from '@ember/component/helper';

export default helper(function isLast([maybeLastItem, list]/*, hash*/) {
  let lastIndex = list.length - 1;
  return list[lastIndex] === maybeLastItem;
});
