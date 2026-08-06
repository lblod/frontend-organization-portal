import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
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

    return await this.store.query('worship-service', query);
  });
}
