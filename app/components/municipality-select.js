import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class MunicipalitySelectComponent extends Component {
  @service store;
  @tracked municipalities;

  constructor(...args) {
    super(...args);
    this.loadMunicipalities.perform();
  }

  @restartableTask
  *loadMunicipalities(searchParams = '') {
    const query = {
      filter: {
        level: 'Gemeente',
      },
      page: {
        size: 400,
      },
      sort: 'label',
    };

    if (searchParams.length > 1) {
      query['filter[label]'] = searchParams;
    }

    const options = yield this.store
      .query('location', query)
      .then(function (municipalities) {
        return municipalities.mapBy('label');
      });

    this.municipalities = options;
  }
}
