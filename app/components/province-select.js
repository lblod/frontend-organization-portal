import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

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
        classification: {
          id: CLASSIFICATION_CODE.PROVINCE,
        },
      },
      sort: 'name',
    };

    const provinces = yield this.store.query('administrative-unit', query);

    return provinces.mapBy('name');
  }
}
