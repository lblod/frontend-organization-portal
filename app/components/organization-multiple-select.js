import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { ORGANIZATION_STATUS } from '../models/organization-status-code';

export default class OrganizationMultipleSelectComponent extends Component {
  @service store;

  @restartableTask
  *loadOrganizationsMultipleTask(searchParams = '') {
    yield timeout(500);

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

    return yield this.store.query('organization', query);
  }
}
