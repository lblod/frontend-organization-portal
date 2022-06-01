import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { useTask } from 'ember-resources';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import {
  CENTRAL_WORSHIP_SERVICE_BOARD_POSITIONS_BLACKLIST,
  WORSHIP_SERVICE_POSITIONS_BOARD_BLACKLIST,
  BESTURSLEDEN_POSITIONS_BOARD_BLACKLIST,
  MANDATARISSEN_POSITIONS_BOARD_BLACKLIST,
} from 'frontend-organization-portal/models/board-position';

export default class MandateRoleSelectComponent extends Component {
  @service store;

  mandateRoles = useTask(this, this.loadMandateRolesTask, () => [
    this.args.selectedAdministrativeUnit,
  ]);

  @task *loadMandateRolesTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    let positions = yield this.store.findAll('board-position');

    // Filter out positions depending on religion type when organization is set
    if (
      this.args.selectedAdministrativeUnit &&
      this.args.selectedAdministrativeUnit.id
    ) {
      const classification = yield this.args.selectedAdministrativeUnit
        .classification;

      positions = this.filterOutBlacklistedPositions(positions, classification);

      if (this.args.isInMandatarissenContext) {
        positions = positions.filter(
          (position) =>
            !this.isIdInBlacklist(
              position.id,
              MANDATARISSEN_POSITIONS_BOARD_BLACKLIST
            )
        );
      }

      if (this.args.isInBestuursledenContext) {
        positions = positions.filter(
          (position) =>
            !this.isIdInBlacklist(
              position.id,
              BESTURSLEDEN_POSITIONS_BOARD_BLACKLIST
            )
        );
      }
    }
    return positions;
  }

  filterOutBlacklistedPositions(positions, classification) {
    if (classification.id == CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE) {
      positions = positions.filter(
        (position) =>
          !this.isIdInBlacklist(
            position.id,
            CENTRAL_WORSHIP_SERVICE_BOARD_POSITIONS_BLACKLIST
          )
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
