import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask, timeout } from 'ember-concurrency';

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsEditController extends Controller {
  @service store;

  get totalFinancingPercentage() {
    // TODO loop over all involvements and sum the percentages
    return 0;
  }

  get isFinancingTotalValid() {
    // TODO check if the total is valid
    return true;
  }

  setup() {
    if (this.model.involvements.length === 0) {
      this.addNewLocalInvolvement();
    }
  }

  reset() {
    // TODO loop over all involvements and rollback any unsaved changes
  }

  @action
  addNewLocalInvolvement() {
    this.model.involvements.pushObject(
      this.store.createRecord('local-involvement', {
        worshipService: this.model.administrativeUnit,
      })
    );
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    // TODO check if the total financing percentage is valid before saving

    // TODO loop over all  involvements items and save them

    yield timeout(500); // TODO remove this once saving is implemented
  }
}
