import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { ORGANIZATION_STATUS } from '../models/organization-status-code';

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

      return await this.store.query('central-worship-service', query);
    },
  );
}
