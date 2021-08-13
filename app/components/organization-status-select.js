import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class OrganizationStatusSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.fetchOrganizationStatusTask.perform();
  }

  @task *fetchOrganizationStatusTask() {
    return yield this.store.findAll('organization-status-code');
  }
}
