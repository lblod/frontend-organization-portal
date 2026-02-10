import Component from '@glimmer/component';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';

export default class TrimInputComponent extends Component {
  @restartableTask
  *trimInput(event) {
    const input = (yield event.target.value).trim();
    if (this.args.value !== input) this.args.onUpdate(input);
  }

  @action
  handleKeydown(event) {
    if (event.key === 'Enter') {
      this.trimInput.perform(event);
    }
  }
}
