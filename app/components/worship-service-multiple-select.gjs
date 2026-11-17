import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';
import { ORGANIZATION_STATUS } from '../models/organization-status-code';

export default class WorshipServiceSelectComponent extends Component {
  @service store;

  loadWorshipServicesTask = restartableTask(async (searchParams = '') => {
    await timeout(500);

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

    if (searchParams.trim() !== '') {
      query['filter[name]'] = searchParams;
    }

    const { content } = await this.store.request(
      queryBuilder('worship-service', query),
    );

    return content;
  });
}

<PowerSelect
  @multiple={{true}}
  @allowClear={{true}}
  @searchEnabled={{true}}
  @loadingMessage="Aan het laden..."
  @noMatchesMessage="Geen resultaten"
  @searchMessage="Typ om te zoeken"
  @searchField="name"
  @search={{perform this.loadWorshipServicesTask}}
  @selected={{@selected}}
  @onChange={{@onChange}}
  @triggerId={{@id}}
  ...attributes
  as |worshipService|
>
  {{worshipService.abbName}}
</PowerSelect>