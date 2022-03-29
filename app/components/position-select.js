import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default class PositionSelectComponent extends Component {
  @service store;

  constructor() {
    super(...arguments);

    this.loadPositionTask.perform();
  }

  get selectedPosition() {
    if (typeof this.args.selected === 'string') {
      return this.findPositionById(this.args.selected);
    }

    return this.args.selected;
  }

  findPositionById(id) {
    if (this.loadPositionTask.isRunning) {
      return null;
    }

    let position = this.loadPositionTask.last.value;
    return position.find((p) => p.id === id);
  }

  @task *loadPositionTask() {
    const ministerPositions = yield this.store.findAll(
      'minister-position-function'
    );
    const mandatePositions = yield this.store.findAll('board-position');
    return [...ministerPositions.toArray(), ...mandatePositions.toArray()];
  }
}
