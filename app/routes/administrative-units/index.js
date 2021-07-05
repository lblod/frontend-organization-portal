import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

const CLASSIFICATION = {
  CENTRAL_WORSHIP_SERVICE: {
    id: 'f9cac08a-13c1-49da-9bcb-f650b0604054',
    label: 'Centraal bestuur van de eredienst',
  },
  WORSHIP_SERVICE: {
    id: '66ec74fd-8cfc-4e16-99c6-350b35012e86',
    label: 'Bestuur van de eredienst',
  },
};

export default class AdministrativeUnitsIndexRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
  };

  async model(params) {
    let statuses = await this.store.findAll('organization-status-code');
    let honoraryServiceTypes = await this.store.findAll(
      'honorary-service-type'
    );

    return {
      classifications: Object.values(CLASSIFICATION),
      honoraryServiceTypes,
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
        'honorary-service-type',
        'organization-status',
        'primary-site.address',
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
    } else {
      // Only show worship related administrative units for now
      query['filter[classification][:id:]'] = [
        CLASSIFICATION.WORSHIP_SERVICE.id,
        CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id,
      ].join();
    }

    if (params.honoraryServiceType) {
      query['filter[honorary-service-type][:id:]'] = params.honoraryServiceType;
    }

    if (params.municipality) {
      query['filter[primary-site][address][municipality]'] =
        params.municipality;
    }

    if (params.organizationStatus) {
      query['filter[organization-status][:id:]'] = params.organizationStatus;
    }

    return yield this.store.query('administrative-unit', query);
  }
}
