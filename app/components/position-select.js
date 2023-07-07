import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class PositionSelectComponent extends Component {
  @service store;
  @service currentSession;

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

    let boardPositionCodes = [];
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

      boardPositionCodes = yield this.store.query('board-position-code', {
        'filter[applies-to][applies-within][:id:]': classification.id,
      });

      if (classification.id == CLASSIFICATION_CODE.WORSHIP_SERVICE) {
        ministerPositions = yield this.store.query(
          'minister-position-function',
          {
            page: { size: 100 },
          }
        );
      }
    } else {
      let allowedIds = [];
      if (this.currentSession.hasUnitRole) {
        allowedIds = [
          CLASSIFICATION_CODE.MUNICIPALITY,
          CLASSIFICATION_CODE.PROVINCE,
          CLASSIFICATION_CODE.OCMW,
          CLASSIFICATION_CODE.DISTRICT,
          CLASSIFICATION_CODE.AGB,
          CLASSIFICATION_CODE.APB,
        ];
      } else {
        allowedIds = [
          CLASSIFICATION_CODE.WORSHIP_SERVICE,
          CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE,
        ];
      }
      boardPositionCodes = yield this.store.query('board-position-code', {
        'filter[applies-to][applies-within][:id:]': allowedIds.join(),
        page: { size: 100 },
      });
      if (this.currentSession.hasWorshipRole) {
        ministerPositions = yield this.store.query(
          'minister-position-function',
          {
            page: { size: 100 },
          }
        );
      }
    }

    let positions;
    if (ministerPositions.length) {
      positions = [
        ...ministerPositions.toArray(),
        ...boardPositionCodes.toArray(),
      ].sort(function (a, b) {
        return a.label.localeCompare(b.label);
      });
    } else {
      positions = [...boardPositionCodes.toArray()].sort(function (a, b) {
        return a.label.localeCompare(b.label);
      });
    }

    return positions;
  }
}
