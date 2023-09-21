import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitSelectByKboNumberComponent extends Component {
  @service muSearch;
  @service currentSession;

  @task
  *loadAdministrativeUnitsTask(searchParams = '') {
    const filter = {};

    if (searchParams.trim() !== '') {
      filter[`:phrase_prefix:identifier.notation`] = 'KBO';
      filter[`:phrase_prefix:identifier.value`] = searchParams.trim();
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
        ${CLASSIFICATION.MUNICIPALITY.id},
        ${CLASSIFICATION.PROVINCE.id},
        ${CLASSIFICATION.OCMW.id},
        ${CLASSIFICATION.DISTRICT.id},
        ${CLASSIFICATION.PROJECTVERENIGING.id},
        ${CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id},
        ${CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id},
        ${CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id},
        ${CLASSIFICATION.POLICE_ZONE.id},
        ${CLASSIFICATION.ASSISTANCE_ZONE.id},
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
        const index = entry.identifier.findIndex(
          (id) => id.notation === 'KBO nummer'
        );
        let value = entry.identifier[index].value;
        // TODO: prevent matches on index other than KBO numbers to be included
        // at all (mu-search currently does not support only index KBO numbers
        // without also indexing the other identifiers such as OVO and
        // Sharepoint)
        if (value.includes(searchParams.trim())) {
          return value;
        }
      },
    });

    if (result) {
      return [...[searchParams], ...new Set(result.toArray())];
    }
  }
}
