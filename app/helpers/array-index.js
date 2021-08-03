import { helper } from '@ember/component/helper';

export default helper(function arrayIndex([array, index]) {
  return array && array.objectAt
    ? array.objectAt(index)
    : array && array[index];
});
