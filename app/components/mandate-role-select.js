import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class MandateRoleSelectComponent extends Component {
  @service fastboot;
  @service store;

  constructor() {
    super(...arguments);

    if (!this.fastboot.isFastBoot) {
      this.loadMandateRolesTask.perform();
    }
  }

  @task *loadMandateRolesTask() {
    return yield this.store.findAll('board-position');
  }
}
