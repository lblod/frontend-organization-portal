import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { findAll } from '@warp-drive/legacy/compat/builders';
import PowerSelect from 'ember-power-select/components/power-select';

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
    const { content: statuses } = await this.store.request(
      findAll('organization-status-code'),
    );
    return statuses;
  });

  <template>
    <div class={{if @error "ember-power-select--error"}}>
      <PowerSelect
        @allowClear={{@allowClear}}
        @searchEnabled={{true}}
        @searchField="label"
        @loadingMessage="Aan het laden..."
        @options={{this.loadOrganizationStatusesTask.last}}
        @selected={{this.selectedOrganizationStatus}}
        @onChange={{@onChange}}
        @triggerId={{@id}}
        as |organizationStatus|
      >
        {{organizationStatus.label}}
      </PowerSelect>
    </div>
  </template>
}
