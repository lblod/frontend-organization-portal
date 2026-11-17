import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';
import { ORGANIZATION_STATUS } from '../models/organization-status-code';

export default class OrganizationMultipleSelectComponent extends Component {
  @service store;

  loadOrganizationsMultipleTask = restartableTask(async (searchParams = '') => {
    await timeout(500);

    const query = {
      sort: 'name',
      include: 'organization-status,classification',
    };

    let classificationCodes = this.args.classificationCodes;
    if (classificationCodes.length) {
      query.filter = {
        classification: {
          ':id:': classificationCodes.join(),
        },
        'organization-status': {
          id: this.args.limitToActiveOrganizations
            ? ORGANIZATION_STATUS.ACTIVE
            : undefined,
        },
      };
    }

    if (searchParams.trim() !== '') {
      query['filter[name]'] = searchParams;
    }

    const { content } = await this.store.request(
      queryBuilder('organization', query),
    );

    return content;
  });
}

<div class={{if @error "ember-power-select--error"}} ...attributes>
  <PowerSelect
    @multiple={{true}}
    @disabled={{@disabled}}
    @allowClear={{true}}
    @searchEnabled={{true}}
    @loadingMessage="Aan het laden..."
    @noMatchesMessage="Geen resultaten"
    @searchMessage="Typ om te zoeken"
    @searchField="name"
    @search={{perform this.loadOrganizationsMultipleTask}}
    @selected={{@selected}}
    @onChange={{@onChange}}
    @triggerId={{@id}}
    as |organization|
  >
    {{organization.abbName}}
    ({{organization.classification.label}})
  </PowerSelect>
</div>