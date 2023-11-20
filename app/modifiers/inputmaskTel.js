import { modifier } from 'ember-modifier';
import Inputmask from 'inputmask';

export default modifier(function inputmaskTel(element) {
  new Inputmask({
    regex: '(\\+)\\d{10}\\d*',
    lazy: true,
  }).mask(element);
});
