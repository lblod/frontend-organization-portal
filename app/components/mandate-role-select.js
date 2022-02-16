import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class MandateRoleSelectComponent extends Component {
  @service store;
  @tracked loadedRecord;

  constructor() {
    super(...arguments);
    this.loadRecord.perform();
    this.loadMandateRolesTask.perform();
  }

  get selectedMandateRole() {
    if (typeof this.args.selected === 'string') {
      return this.loadedRecord;
    }

    return this.args.selected;
  }

  @task *loadMandateRolesTask() {
    return yield this.store.findAll('board-position');
  }
  @task
  *loadRecord() {
    let selectedRole = this.args.selected;
    if (typeof selectedRole === 'string') {
      this.loadedRecord = yield this.store.findRecord(
        'board-position',
        selectedRole
      );
    }
  }
}
