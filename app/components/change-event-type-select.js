import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CENTRAL_WORSHIP_SERVICE_BLACKLIST } from 'frontend-organization-portal/models/change-event-type';

export default class ChangeEventTypeSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadChangeEventTypesTask.perform();
  }

  @task *loadChangeEventTypesTask() {
    let types = yield this.store.findAll('change-event-type');

    if (this.args.isCentralWorshipService) {
      // Filter out blacklisted types for central worship services
      types = types.filter((t) => !this.isIdInBlacklist(t.id));
    }

    return types;
  }

  isIdInBlacklist(id) {
    return CENTRAL_WORSHIP_SERVICE_BLACKLIST.find((element) => element == id);
  }
}
