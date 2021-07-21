import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class CentralWorshipSelectComponent extends Component {
  @service fastboot;
  @service store;
  centralWorshipServices;

  constructor(...args) {
    super(...args);

    if (!this.fastboot.isFastBoot) {
      this.centralWorshipServices =
        this.loadCentralWorshipServicesTask.perform();
    }
  }

  @task
  *loadCentralWorshipServicesTask() {
    const query = {
      page: {
        size: 1000,
      },
      sort: 'name',
    };

    return yield this.store.query('central-worship-service', query);
  }
}
