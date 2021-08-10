import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class ClassificationSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.fetchClassificationTask.perform();
  }

  @task *fetchClassificationTask() {
    return yield this.store.findAll('administrative-unit-classification-code');
  }
}
