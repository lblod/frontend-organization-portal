import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import {
  BOARD_MEMBER_ROLES,
  MANDATARIES_ROLES,
} from 'frontend-organization-portal/models/board-position';

export default class MandateRoleSelectComponent extends Component {
  @service store;

  mandateRoles = trackedTask(this, this.loadMandateRolesTask, () => [
    this.args.selectedAdministrativeUnit,
  ]);

  @task *loadMandateRolesTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    let positions = [];

    if (
      this.args.selectedAdministrativeUnit &&
      this.args.selectedAdministrativeUnit.id
    ) {
      const classification = yield this.args.selectedAdministrativeUnit
        .classification;

      // Only get positions available for this type of administrative unit
      positions = yield this.store.query('board-position', {
        'filter[applies-to][applies-within][:id:]': classification.id,
      });

      // Filter out positions depending on religion type when organization is set
      if (this.args.isInMandatarissenContext) {
        positions = positions.filter(
          (position) => !this.isIdInBlacklist(position.id, BOARD_MEMBER_ROLES)
        );
      }

      if (this.args.isInBestuursledenContext) {
        positions = positions.filter(
          (position) => !this.isIdInBlacklist(position.id, MANDATARIES_ROLES)
        );
      }
    } else {
      positions = yield this.store.findAll('board-position');
    }
    return positions;
  }

  isIdInBlacklist(id, blacklist) {
    return blacklist.find((element) => element == id);
  }
}
