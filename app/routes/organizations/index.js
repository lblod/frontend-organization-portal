import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import {
  selectByRole as getClassificationIds,
  getClassificationIdsForRole,
} from 'frontend-organization-portal/utils/classification-identifiers';

export default class OrganizationsIndexRoute extends Route {
  @service muSearch;
  @service currentSession;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
    name: { refreshModel: true, replace: true },
    identifier: { refreshModel: true, replace: true },
    municipality: { refreshModel: true, replace: true },
    province: { refreshModel: true, replace: true },
    organizationTypes: { refreshModel: true, replace: true },
    classificationIds: { refreshModel: true, replace: true },
    recognizedWorshipTypeId: { refreshModel: true, replace: true },
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

      filter[`:${filterType}:legal_name,alternative_name,name`] = name;
    }

    if (params.identifier) {
      // Notes:
      // - toLowerCase is needed to properly match OVO numbers
      // - use index field that only contains alphanumeric characters
      //   (cf. mu-search configuration)
      filter[':prefix:identifier.index'] = params.identifier
        .toLowerCase()
        .trim();
    }

    // Determine classification codes based on user selection, if any
    let queryClassifications = [];
    if (params.classificationIds && params.organizationTypes) {
      const idsFromOrganizationType = getClassificationIdsForRole(
        this.currentSession.hasWorshipRole,
        false,
        ...params.organizationTypes.split(','),
      );

      const idsFromClassifications = params.classificationIds.split(',');

      queryClassifications = idsFromOrganizationType
        .filter((id) => idsFromClassifications.includes(id))
        .map((id) => `(classification_id:${id})`)
        .join(' OR ');
    } else if (params.organizationTypes) {
      queryClassifications = getClassificationIdsForRole(
        this.currentSession.hasWorshipRole,
        false,
        ...params.organizationTypes.split(','),
      ).join(' OR ');
    } else if (params.classificationIds) {
      queryClassifications = params.classificationIds
        .split(',')
        .map((id) => `(classification_id:${id})`)
        .join(' OR ');
    } else {
      queryClassifications = getClassificationIds(
        this.currentSession.hasWorshipRole,
      );
    }
    filter[':query:classification_id'] = queryClassifications;

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
    } else {
      filter[':query:status_id'] = `(_exists_:status_id)`;
    }

    return yield this.muSearch.search({
      index: 'organizations',
      page: params.page,
      size: params.size,
      sort: params.sort,
      filters: filter,
      dataMapping: (data) => {
        const entry = data.attributes;
        entry.id = data.id;
        entry.route = 'organizations.organization.index';

        return entry;
      },
    });
  }
}
