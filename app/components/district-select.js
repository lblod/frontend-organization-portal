import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class WorshipServiceMultipleSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadDistrictsTask.perform();
  }

  @restartableTask
  *loadDistrictsTask(searchParams = '') {
    yield timeout(500);

    const query = {
      filter: {
        classification: {
          id: CLASSIFICATION_CODE.DISTRICT,
        },
      },
      sort: 'name',
    };

    if (searchParams.trim() !== '') {
      query['filter[name]'] = searchParams;
    }

    return yield this.store.query('administrative-unit', query);
  }
}
