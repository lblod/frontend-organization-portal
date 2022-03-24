import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
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

export default class AdministrativeUnitSelectByNameComponent extends Component {
  @service muSearch;

  @restartableTask
  *loadAdministrativeUnitsTask(searchParams = '') {
    yield timeout(500);

    const filter = {};

    // Only show worship related administrative units for now
    filter[
      'classification_id'
    ] = `${CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id},${CLASSIFICATION.WORSHIP_SERVICE.id}`;

    if (searchParams.trim() !== '') {
      filter[`:phrase_prefix:name`] = searchParams;
    }

    return yield this.muSearch.search({
      index: 'units',
      sort: 'name',
      page: '0',
      size: '100',
      filters: filter,
      dataMapping: (data) => {
        const entry = data.attributes;
        console.log(entry);
        return entry.name;
      },
    });
  }
}
