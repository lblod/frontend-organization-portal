import { modifier } from 'ember-modifier';
import Inputmask from 'inputmask';

export default modifier(function inputmaskTel(element) {
  new Inputmask({
    regex: '(0|\\+)\\d{6}\\d*',
    lazy: true,
  }).mask(element);
});
