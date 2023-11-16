import { helper } from '@ember/component/helper';

export default helper(function telFormat([tel]) {
  if (tel.includes('tel:')) {
    return tel.split(':')[1];
  }
});
