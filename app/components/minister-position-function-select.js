import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import { trackedTask } from 'ember-resources/util/ember-concurrency';
import { MAPPING_POSITION_RELIGION } from 'frontend-organization-portal/models/minister-position';

export default class MinisterPositionFunctionSelectComponent extends Component {
  @service store;

  positionFunctions = trackedTask(this, this.loadPositionFunctionsTask, () => [
    this.args.selectedAdministrativeUnit,
  ]);

  @task *loadPositionFunctionsTask() {
    // Trick used to avoid infinite loop
    // See https://github.com/NullVoxPopuli/ember-resources/issues/340 for more details
    yield Promise.resolve();

    const positions = yield this.store.query('minister-position-function', {
      'page[size]': 20,
    });

    // Filter out positions depending on religion type when organization is set
    if (
      this.args.selectedAdministrativeUnit &&
      this.args.selectedAdministrativeUnit.id
    ) {
      const religion = yield this.args.selectedAdministrativeUnit
        .recognizedWorshipType;
      const allowedPositionIds = MAPPING_POSITION_RELIGION[religion.id];

      return positions.filter((position) =>
        allowedPositionIds.find((allowedId) => allowedId == position.id)
      );
    } else {
      return positions;
    }
  }
}
