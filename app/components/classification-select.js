import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

const CLASSIFICATION = {
  CENTRAL_WORSHIP_SERVICE: 'f9cac08a-13c1-49da-9bcb-f650b0604054',
  WORSHIP_SERVICE: '66ec74fd-8cfc-4e16-99c6-350b35012e86',
};
export default class ClassificationSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.fetchClassificationTask.perform();
  }

  @task *fetchClassificationTask() {
    return yield this.store.query('administrative-unit-classification-code', {
      'filter[:id:]': [
        CLASSIFICATION.WORSHIP_SERVICE.id,
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
      ].join(),
    });
  }
}
