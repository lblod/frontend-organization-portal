import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { query as queryBuilder } from '@warp-drive/legacy/compat/builders';
import PowerSelect from 'ember-power-select/components/power-select';
import perform from 'ember-concurrency/helpers/perform';

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

    const { content: nationalities } = await this.store.request(
      queryBuilder('nationality', query),
    );
    return nationalities.map((n) => n.countryLabel);
  });

  <template>
    <PowerSelect
      @allowClear={{true}}
      @loadingMessage="Aan het laden..."
      @noMatchesMessage="Geen resultaten"
      @onChange={{@onChange}}
      @search={{perform this.searchCountriesTask}}
      @searchEnabled={{true}}
      @searchField="label"
      @searchMessage="Typ om te zoeken"
      @selected={{@selected}}
      @triggerId={{@id}}
      as |country|
    >
      {{country}}
    </PowerSelect>
  </template>
}
