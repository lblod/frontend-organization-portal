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

    this.loadClassificationsTask.perform();
  }

  get selectedClassification() {
    if (typeof this.args.selected === 'string') {
      return this.findClassificationById(this.args.selected);
    }

    return this.args.selected;
  }

  findClassificationById(id) {
    if (this.loadClassificationsTask.isRunning) {
      return null;
    }

    let classifications = this.loadClassificationsTask.last.value;
    return classifications.find((status) => status.id === id);
  }

  @task *loadClassificationsTask() {
    return yield this.store.query('administrative-unit-classification-code', {
      'filter[:id:]': [
        CLASSIFICATION.WORSHIP_SERVICE,
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE,
      ].join(),
    });
  }
}
