import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { keepLatestTask } from 'ember-concurrency';
import { selectByRole as getClassificationIds } from 'frontend-organization-portal/utils/classification-identifiers';
import { isNonAdministrativeUnit } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsIndexRoute extends Route {
  @service muSearch;
  @service currentSession;

  queryParams = {
    page: { refreshModel: true },
    sort: { refreshModel: true },
    name: { refreshModel: true, replace: true },
    identifier: { refreshModel: true, replace: true },
    municipality: { refreshModel: true, replace: true },
    province: { refreshModel: true, replace: true },
    classificationIds: { refreshModel: true, replace: true },
    recognizedWorshipTypeId: { refreshModel: true, replace: true },
    organizationStatus: { refreshModel: true, replace: true },
  };

  async model(params) {
    return {
      loadAdministrativeUnitsTaskInstance:
        this.loadAdministrativeUnitsTask.perform(params),
      loadedAdministrativeUnits:
        this.loadAdministrativeUnitsTask.lastSuccessful?.value,
    };
  }

  @keepLatestTask({ cancelOn: 'deactivate' })
  *loadAdministrativeUnitsTask(params) {
    const filter = {};
    if (params.name) {
      let filterType = 'phrase_prefix';
      let name = params.name.trim();

      filter[`:${filterType}:legal_name,name`] = name;
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

    if (params.classificationIds) {
      const queryIds = params.classificationIds
        .split(',')
        .map((id) => `(classification_id:${id})`)
        .join(' OR ');

      filter[':query:classification_id'] = queryIds;
    } else {
      filter['classification_id'] = getClassificationIds(
        this.currentSession.hasWorshipRole
      );
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
    } else {
      filter[':query:status_id'] = `(_exists_:status_id)`;
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
        if (isNonAdministrativeUnit(entry.classification_id)) {
          entry.route = 'organizations.organization.index';
        } else {
          entry.route = 'administrative-units.administrative-unit.index';
        }
        return entry;
      },
    });
  }
}
