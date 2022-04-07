import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitSelectByNameComponent extends Component {
  @service muSearch;

  @restartableTask
  *loadAdministrativeUnitsTask(searchParams = '') {
    const filter = {};

    // Only show worship related administrative units for now
    filter[
      'classification_id'
    ] = `${CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id},${CLASSIFICATION.WORSHIP_SERVICE.id}`;

    if (searchParams.trim() !== '') {
      filter[`:phrase_prefix:name`] = searchParams;
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
    if (searchParams.trim() !== '' && result) {
      return [...[searchParams], ...result.toArray()];
    }
    return result;
  }
}
