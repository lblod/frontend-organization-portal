import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

export default class ProvinceSelectComponent extends Component {
  @service store;
  provinces;

  constructor(...args) {
    super(...args);

    this.provinces = this.loadProvincesTask.perform();
  }

  @restartableTask
  *loadProvincesTask() {
    const query = {
      filter: {
        level: 'Provincie',
      },
      sort: 'label',
    };

    const provinces = yield this.store.query('location', query);

    return provinces.mapBy('label');
  }
}
