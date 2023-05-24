import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';
export default class AdministrativeUnitSelectByNameComponent extends Component {
  @service muSearch;
  @service currentSession;

  @restartableTask
  *loadAdministrativeUnitsTask(searchParams = '') {
    const filter = {};

    if (searchParams.trim() !== '') {
      filter[`:phrase_prefix:name`] = searchParams;
    }
    if (this.currentSession.hasWorshipRole) {
      filter['classification_id'] = `
         ${CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id},
         ${CLASSIFICATION.WORSHIP_SERVICE.id},
        `;
    } else {
      filter['classification_id'] = `
        ${CLASSIFICATION.AGB.id},
         ${CLASSIFICATION.APB.id},
         ${CLASSIFICATION.MUNICIPALITY.id}
         ${CLASSIFICATION.PROVINCE.id}
         ${CLASSIFICATION.OCMW.id}
         ${CLASSIFICATION.DISTRICT.id}
       `;
    }

    const result = yield this.muSearch.search({
      index: 'units',
      sort: 'name',
      page: '0',
      size: '100',
      filters: filter,
      dataMapping: (data) => {
        const entry = data.attributes;
        return entry.name;
      },
    });

    if (result) {
      return [...[searchParams], ...new Set(result.toArray())];
    }
  }
}
