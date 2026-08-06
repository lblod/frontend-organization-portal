import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

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

    const nationalitues = await this.store.query('nationality', query);
    return nationalitues.map((n) => n.countryLabel);
  });
}
