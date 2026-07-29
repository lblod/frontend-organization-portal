import Component from '@glimmer/component';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';

export default class OperationAreaMultipleSelectComponent extends Component {
  @service store;

  get selectedOperationAreas() {
    let selectionArray = [];

    if (typeof this.args.selected === 'string' && this.args.selected.length) {
      const labels = this.args.selected.split(',');
      labels.forEach((label) => {
        selectionArray.push(label);
      });
    }

    if (selectionArray.length) {
      return selectionArray;
    }

    return this.args.selected;
  }

  loadOperationAreasTask = task(async () => {
    await Promise.resolve();

    const query = {
      'filter[in-scheme][:uri:]':
        'http://lblod.data.gift/concept-schemes/3307738e-f84d-4f95-9b14-3e9162d83394',
      sort: 'label',
      page: {
        size: 400,
      },
    };

    const operationAreas = await this.store.query('concept', query);

    return operationAreas.map(({ label }) => label);
  });

  operationAreas = trackedTask(this, this.loadOperationAreasTask);
}
