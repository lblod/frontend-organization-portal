import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class PositionSelectComponent extends Component {
  @service store;

  positions = trackedTask(this, this.loadPositionTask, () => [
    this.args.selectedAdministrativeUnit,
  ]);

  get selectedPosition() {
    if (typeof this.args.selected === 'string') {
      return this.findPositionById(this.args.selected);
    }

    return this.args.selected;
  }

  findPositionById(id) {
    if (this.positions.isRunning) {
      return null;
    }

    let position = this.positions.value;
    return position.find((p) => p.id === id);
  }

  @task *loadPositionTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    let boardPositions = [];
    let ministerPositions = [];

    // Filter out blacklisted data if an administrative unit is selected
    if (
      this.args.selectedAdministrativeUnit &&
      this.args.selectedAdministrativeUnit.length
    ) {
      const selectedAdministrativeUnitId = this.args.selectedAdministrativeUnit;

      const administrativeUnit = (yield this.store.query(
        'administrative-unit',
        {
          'filter[:id:]': selectedAdministrativeUnitId,
          include: 'classification',
        }
      )).firstObject;

      const classification = yield administrativeUnit.classification;

      boardPositions = yield this.store.query('board-position', {
        'filter[applies-to][applies-within][:id:]': classification.id,
      });

      if (classification == CLASSIFICATION_CODE.WORSHIP_SERVICE) {
        ministerPositions = yield this.store.findAll(
          'minister-position-function'
        );
      }
    } else {
      boardPositions = yield this.store.findAll('board-position');

      ministerPositions = yield this.store.findAll(
        'minister-position-function'
      );
    }

    let positions;
    if (ministerPositions.length) {
      positions = [
        ...ministerPositions.toArray(),
        ...boardPositions.toArray(),
      ].sort(function (a, b) {
        return a.label.localeCompare(b.label);
      });
    } else {
      positions = [...boardPositions.toArray()].sort(function (a, b) {
        return a.label.localeCompare(b.label);
      });
    }

    return positions;
  }
}
