import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class MinisterPositionFunctionSelectComponent extends Component {
  @service fastboot;
  @service store;

  constructor() {
    super(...arguments);

    if (!this.fastboot.isFastBoot) {
      this.fetchMinisterPositionFunctionsTask.perform();
    }
  }

  @task *fetchMinisterPositionFunctionsTask() {
    return yield this.store.query('minister-position-function', {
      'page[size]': 1000,
    });
  }
}
