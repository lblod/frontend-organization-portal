import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class TrimInputComponent extends Component {
  @tracked
  _innerValue;

  constructor(...args) {
    super(...args);
    this._innerValue = this.args.value;
  }

  get value() {
    return this._innerValue;
  }

  set value(newVal) {
    this._innerValue = newVal?.replace(/\s+/g, ' ');
    this.args.onUpdate(this._innerValue.trim());
  }
}
