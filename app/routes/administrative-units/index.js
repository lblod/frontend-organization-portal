import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

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
      // Only show worship related administrative units & municipalities for now
      filter['classification_id'] = `
        ${CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id},
        ${CLASSIFICATION.WORSHIP_SERVICE.id},
        ${CLASSIFICATION.MUNICIPALITY.id}
      `;
    }

    if (params.municipality) {
      filter[':phrase:municipality'] = params.municipality;
    }

    if (params.province) {
      filter[':phrase:province'] = params.province;
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
