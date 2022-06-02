import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import {
  CENTRAL_WORSHIP_SERVICE_BOARD_POSITIONS_BLACKLIST,
  WORSHIP_SERVICE_POSITIONS_BOARD_BLACKLIST,
} from 'frontend-organization-portal/models/board-position';
import { CENTRAL_WORSHIP_SERVICE_MINISTER_POSITIONS_BLACKLIST } from 'frontend-organization-portal/models/minister-position';

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

    const ministerPositions = yield this.store.findAll(
      'minister-position-function'
    );
    const mandatePositions = yield this.store.findAll('board-position');

    let positions = [
      ...ministerPositions.toArray(),
      ...mandatePositions.toArray(),
    ].sort(function (a, b) {
      return a.label.localeCompare(b.label);
    });

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
      positions = this.filterOutBlacklistedPositions(positions, classification);
    }

    return positions;
  }

  filterOutBlacklistedPositions(positions, classification) {
    if (classification.id == CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE) {
      positions = positions.filter(
        (position) =>
          !this.isIdInBlacklist(position.id, [
            ...CENTRAL_WORSHIP_SERVICE_BOARD_POSITIONS_BLACKLIST,
            ...CENTRAL_WORSHIP_SERVICE_MINISTER_POSITIONS_BLACKLIST,
          ])
      );
    } else if (classification.id == CLASSIFICATION_CODE.WORSHIP_SERVICE) {
      positions = positions.filter(
        (position) =>
          !this.isIdInBlacklist(
            position.id,
            WORSHIP_SERVICE_POSITIONS_BOARD_BLACKLIST
          )
      );
    }
    return positions;
  }

  isIdInBlacklist(id, blacklist) {
    return blacklist.find((element) => element == id);
  }
}
