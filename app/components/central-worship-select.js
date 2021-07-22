import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

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

  @restartableTask
  *loadCentralWorshipServicesTask(searchParams = '') {
    const query = {
      sort: 'name',
    };

    if (searchParams.length > 1) {
      query['filter[name]'] = searchParams;
    }

    return yield this.store.query('central-worship-service', query);
  }
}
