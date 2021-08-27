import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class GenderSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadGendersTask.perform();
  }

  @task
  *loadGendersTask() {
    return yield this.store.findAll('gender-code');
  }
}
