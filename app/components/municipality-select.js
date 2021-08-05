import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

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
        level: 'Gemeente',
      },
      page: {
        size: 400,
      },
      sort: 'label',
    };

    const municipalities = yield this.store.query('location', query);

    return municipalities.mapBy('label');
  }
}
