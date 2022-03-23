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
  @service muSearch;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
    name: { replace: true },
    municipality: { replace: true },
    province: { replace: true },
    classificationId: { replace: true },
    recognizedWorshipTypeId: { replace: true },
    organizationStatus: { replace: true },
  };

  async model(params) {
    return {
      loadAdministrativeUnitsTaskInstance:
        this.loadAdministrativeUnitsTask.perform(params),
      loadedAdministrativeUnits:
        this.loadAdministrativeUnitsTask.lastSuccessful?.value,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadAdministrativeUnitsTask(params) {
    const filter = {};

    if (params.name) {
      let filterType = 'phrase_prefix';
      let name = params.name.trim();

      filter[`:${filterType}:name`] = name;
    }

    if (params.classificationId) {
      filter['classification_id'] = params.classificationId;
    } else {
      // Only show worship related administrative units for now
      filter[
        'classification_id'
      ] = `${CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id},${CLASSIFICATION.WORSHIP_SERVICE.id}`;
    }

    if (params.municipality) {
      filter['municipality'] = params.municipality;
    }

    if (params.province) {
      filter['province'] = params.province;
    }

    if (params.recognizedWorshipTypeId) {
      filter['recognized_worship_type_id'] = params.recognizedWorshipTypeId;
    }

    if (params.organizationStatus) {
      filter['status_id'] = params.organizationStatus;
    }
    return yield this.muSearch.search({
      index: 'units',
      page: params.page,
      size: params.size,
      sort: params.sort,
      filters: filter,
      dataMapping: (data) => {
        const entry = data.attributes;
        entry.id = data.id;
        return entry;
      },
    });
  }
}
