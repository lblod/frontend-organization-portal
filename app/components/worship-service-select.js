import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

export default class WorshipServiceSelectComponent extends Component {
  @service fastboot;
  @service store;
  worshipServices;

  constructor(...args) {
    super(...args);

    if (!this.fastboot.isFastBoot) {
      this.worshipServices = this.loadWorshipServicesTask.perform();
    }
  }

  @restartableTask
  *loadWorshipServicesTask(searchParams = '') {
    const query = {
      sort: 'name',
    };

    if (searchParams.length > 1) {
      query['filter[name]'] = searchParams;
    }

    return yield this.store.query('worship-service', query);
  }
}
