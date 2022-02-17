import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class MinisterPositionFunctionSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);
    this.fetchMinisterPositionFunctionsTask.perform();
  }

  @task *fetchMinisterPositionFunctionsTask() {
    const ALL = 20;
    return yield this.store.query('minister-position-function', {
      'page[size]': ALL,
    });
  }
}
