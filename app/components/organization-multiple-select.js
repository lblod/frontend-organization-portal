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
      include: 'organization-status',
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
