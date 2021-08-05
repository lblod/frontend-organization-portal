import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class MandateRoleSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadMandateRolesTask.perform();
  }

  @task *loadMandateRolesTask() {
    return yield this.store.findAll('board-position');
  }
}
