import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class AdministrativeUnitsIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    let [classifications, statuses] = await Promise.all([
      this.store.findAll('administrative-unit-classification-code'),
      this.store.findAll('organization-status-code'),
    ]);

    return {
      classifications,
      statuses,
      loadAdministrativeUnitsTaskInstance:
        this.loadAdministrativeUnitsTask.perform(params),
      loadedAdministrativeUnits:
        this.loadAdministrativeUnitsTask.lastSuccessful?.value,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadAdministrativeUnitsTask(params) {
    let query = {
      include: [
        'classification',
        'province',
        'municipality',
        'organization-status',
      ].join(),
      page: {
        number: params.page,
        size: params.size,
      },
      sort: params.sort,
    };

    if (params.name) {
      query['filter[name]'] = params.name;
    }

    if (params.classification) {
      query['filter[classification][:id:]'] = params.classification;
    }

    if (params.municipality) {
      query['filter[municipality]'] = params.municipality;
    }

    if (params.organizationStatus) {
      query['filter[organization-status][:id:]'] = params.organizationStatus;
    }

    return yield this.store.query('administrative-unit', query);
  }
}
