import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';
import { ORGANIZATION_STATUS } from 'frontend-organization-portal/models/organization-status-code';
import PowerSelect from 'ember-power-select/components/power-select';
import perform from 'ember-concurrency/helpers/perform';

export default class CentralWorshipSelectComponent extends Component {
  @service store;
  centralWorshipServices;

  constructor(...args) {
    super(...args);

    this.centralWorshipServices = this.loadCentralWorshipServicesTask.perform();
  }

  loadCentralWorshipServicesTask = restartableTask(
    async (searchParams = '') => {
      const query = {
        sort: 'name',
        include: 'organization-status',
        filter: {
          'organization-status': {
            id: this.args.limitToActiveOrganizations
              ? ORGANIZATION_STATUS.ACTIVE
              : undefined,
          },
        },
      };

      if (searchParams.length > 1) {
        query['filter[name]'] = searchParams;
      }

      const { content } = await this.store.request(
        queryBuilder('central-worship-service', query),
      );

      return content;
    },
  );

  <template>
    <div class={{if @error "ember-power-select--error"}}>
      <PowerSelect
        @allowClear={{true}}
        @searchEnabled={{true}}
        @loadingMessage="Aan het laden..."
        @noMatchesMessage="Geen resultaten"
        @searchMessage="Typ om te zoeken"
        @searchField="name"
        @search={{perform this.loadCentralWorshipServicesTask}}
        @options={{this.centralWorshipServices}}
        @selected={{@selected}}
        @onChange={{@onChange}}
        @triggerId={{@id}}
        as |centralWorshipService|
      >
        {{centralWorshipService.abbName}}
      </PowerSelect>
    </div>
  </template>
}
