import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class MinisterPositionFunctionSelectComponent extends Component {
  @service store;
  @tracked loadedRecord;

  constructor() {
    super(...arguments);
    this.loadRecord.perform();

    this.fetchMinisterPositionFunctionsTask.perform();
  }
  get selectedMinisterPositionFunction() {
    if (typeof this.args.selected === 'string') {
      return this.loadedRecord;
    }

    return this.args.selected;
  }

  @task
  *loadRecord() {
    let selectedRole = this.args.selected;
    if (typeof selectedRole === 'string') {
      this.loadedRecord = yield this.store.findRecord(
        'minister-position-function',
        selectedRole
      );
    }
  }

  @task *fetchMinisterPositionFunctionsTask() {
    const ALL = 20;
    return yield this.store.query('minister-position-function', {
      'page[size]': ALL,
    });
  }
}
