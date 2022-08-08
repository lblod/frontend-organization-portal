import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

export default class AdministrativeUnitSelectByNameComponent extends Component {
  @service muSearch;

  @restartableTask
  *loadAdministrativeUnitsTask(searchParams = '') {
    const filter = {};

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

    if (result) {
      return [...[searchParams], ...new Set(result.toArray())];
    }
  }
}
