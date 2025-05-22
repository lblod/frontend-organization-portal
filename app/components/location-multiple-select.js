import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

// TODO: open dropdown with all results on focus/open
// TODO: clear input after selection
export default class LocationMultipleSelectComponent extends Component {
  @service store;

  @restartableTask
  *loadLocationsMultipleTask(searchParams = '') {
    const provinces = this.args.provinceLocations;

    const query = {
      filter: { level: 'Gemeente' },
      sort: 'label',
      include: 'located-within',
      // NOTE (21/05/2025): Make sure to load all municipality locations
      page: { size: 400 },
    };

    if (searchParams.trim() !== '') {
      query['filter[label]'] = searchParams;
    }

    const municipalities = yield this.store.query('location', query);

    return this.extractProvinceGroups(provinces, municipalities);
  }

  extractProvinceGroups(provinces, municipalities) {
    return provinces
      .map((province) => this.createGroupForProvince(province, municipalities))
      .filter((group) => group.options.length > 0);
  }

  createGroupForProvince(province, municipalities) {
    return {
      groupName: province.label,
      options: municipalities.filter((municipality) =>
        municipality.isLocatedWithin(province),
      ),
    };
  }
}
