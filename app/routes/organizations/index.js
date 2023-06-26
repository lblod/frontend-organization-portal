import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class OrganizationsIndexRoute extends Route {
  @service muSearch;
  @service currentSession;
  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
    name: { refreshModel: true, replace: true },
    municipality: { refreshModel: true, replace: true },
    province: { refreshModel: true, replace: true },
    classificationId: { refreshModel: true, replace: true },
    organizationStatus: { refreshModel: true, replace: true },
  };

  async model(params) {
    return {
      loadOrganizationsTaskInstance: this.loadOrganizationsTask.perform(params),
      loadedOrganizations: this.loadOrganizationsTask.lastSuccessful?.value,
    };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadOrganizationsTask(params) {
    const filter = {};

    if (params.name) {
      let filterType = 'phrase_prefix';
      let name = params.name.trim();

      filter[`:${filterType}:name`] = name;
    }

    if (params.classificationId) {
      filter['classification_id'] = params.classificationId;
    } else {
      if (this.currentSession.hasWorshipRole) {
        filter['classification_id'] = `
         ${CLASSIFICATION.REPRESENTATIVE_ORGAN.id},
        `;
      } else {
        // TODO add other orgs e.g PEVA_MUN, PEVA_PROV
        filter['classification_id'] = `

       `;
      }
    }

    if (params.municipality) {
      filter[':phrase:municipality'] = params.municipality;
    }

    if (params.province) {
      filter[':phrase:province'] = params.province;
    }

    if (params.organizationStatus) {
      filter['status_id'] = params.organizationStatus;
    } else {
      filter[':query:status_id'] = `(_exists_:status_id)`;
    }
    return yield this.muSearch.search({
      index: 'registered-orgs',
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
