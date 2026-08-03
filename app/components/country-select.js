import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';

export default class CountrySelectComponent extends Component {
  @service store;

  searchCountriesTask = restartableTask(async (search = '') => {
    await timeout(500);

    const query = {
      sort: 'country-label',
    };

    if (search.trim() !== '') {
      query['filter[country-label]'] = search;
    }

    const { content: nationalitues } = await this.store.request(
      queryBuilder('nationality', query),
    );
    return nationalitues.map((n) => n.countryLabel);
  });
}
