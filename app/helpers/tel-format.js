import { helper } from '@ember/component/helper';

export default helper(function telFormat([tel]) {
  if (tel.includes('tel:')) {
    tel = tel.split(':')[1];
  }
  return tel;
});
