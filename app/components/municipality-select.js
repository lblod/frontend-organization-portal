import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class MunicipalitySelectComponent extends Component {
  @service store;
  municipalities;

  constructor(...args) {
    super(...args);

    this.municipalities = this.loadMunicipalitiesTask.perform();
  }

  @restartableTask
  *loadMunicipalitiesTask() {
    const query = {
      filter: {
        classification: {
          id: CLASSIFICATION_CODE.MUNICIPALITY,
        },
      },
      sort: 'name',
      page: {
        size: 400,
      },
    };

    const municipalities = yield this.store.query('administrative-unit', query);

    return municipalities.mapBy('name');
  }
}
