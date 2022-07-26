import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class RepresentativeBodySelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadRegionsTask.perform();
  }

  @task
  *loadRegionsTask(searchParams = '') {
    const query = {
      sort: 'label',
      filter: {
        level: 'Referentieregio',
      },
    };

    if (searchParams.trim() !== '') {
      query['filter[label]'] = searchParams;
    }

    return yield this.store.query('location', query);
  }
}
