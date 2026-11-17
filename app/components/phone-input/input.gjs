import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import Inputmask from 'inputmask';

const phoneInputMask = modifier(function (element) {
  new Inputmask({
    regex: '^\\+?\\d*',
    placeholder: '',
  }).mask(element);

  return () => {
    element.inputmask?.remove();
  };
});

export default class Input extends Component {
  phoneInputMask = phoneInputMask;
}
