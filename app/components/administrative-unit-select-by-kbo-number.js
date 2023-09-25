import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { selectByRole as getClassificationIds } from 'frontend-organization-portal/utils/classification-identifiers';

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

    filter['classification_id'] = getClassificationIds(
      this.currentSession.hasWorshipRole
    );

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
