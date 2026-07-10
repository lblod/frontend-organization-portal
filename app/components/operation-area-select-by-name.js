import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';

export default class OperationAreaSelectByNameComponent extends Component {
  @service store;

  operationAreas = trackedTask(this, this.loadOperationAreasTask);

  @task
  *loadOperationAreasTask() {
    yield Promise.resolve();
    const query = {
      'filter[in-scheme][:uri:]':
        'http://lblod.data.gift/concept-schemes/3307738e-f84d-4f95-9b14-3e9162d83394',
      sort: 'label',
      page: {
        size: 400,
      },
    };

    const operationAreas = yield this.store.query('concept', query);

    return operationAreas.map(({ label }) => label);
  }
}
