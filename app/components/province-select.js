import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class ProvinceSelectComponent extends Component {
  @service store;
  @tracked provinces;

  constructor(...args) {
    super(...args);
    this.loadProvinces.perform();
  }

  @restartableTask
  *loadProvinces() {
    const query = {
      filter: {
        level: 'Provincie',
      },
      sort: 'label',
    };

    const options = yield this.store
      .query('location', query)
      .then(function (provinces) {
        return provinces.mapBy('label');
      });

    this.provinces = options;
  }
}
