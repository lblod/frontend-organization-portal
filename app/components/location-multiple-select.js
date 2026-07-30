import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';

// TODO: open dropdown with all results on focus/open
// TODO: clear input after selection
export default class LocationMultipleSelectComponent extends Component {
  @service store;

  loadLocationsMultipleTask = restartableTask(async (searchParams = '') => {
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

    const { content: municipalities } = await this.store.request(
      queryBuilder('location', query),
    );

    return this.extractProvinceGroups(provinces, municipalities);
  });

  extractProvinceGroups(provinces, municipalities) {
    const provinceGroups = provinces
      .map((province) => this.createGroupForProvince(province, municipalities))
      .filter((group) => group.options.length > 0);

    const unlinkedMunicipalities = municipalities.filter(
      (municipality) =>
        !provinces.some((province) => municipality.isLocatedWithin(province)),
    );

    if (unlinkedMunicipalities.length > 0) {
      provinceGroups.push({
        groupName: 'Buiten Vlaams Gewest',
        options: unlinkedMunicipalities,
      });
    }

    return provinceGroups;
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
