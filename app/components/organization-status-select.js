import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class OrganizationStatusSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadOrganizationStatusesTask.perform();
  }

  get selectedOrganizationStatus() {
    if (typeof this.args.selected === 'string') {
      return this.findOrganizationStatusById(this.args.selected);
    }

    return this.args.selected;
  }

  findOrganizationStatusById(id) {
    if (this.loadOrganizationStatusesTask.isRunning) {
      return null;
    }

    let organizationStatuses = this.loadOrganizationStatusesTask.last.value;
    return organizationStatuses.find((status) => status.id === id);
  }

  loadOrganizationStatusesTask = task(async () => {
    return await this.store.findAll('organization-status-code');
  });
}
