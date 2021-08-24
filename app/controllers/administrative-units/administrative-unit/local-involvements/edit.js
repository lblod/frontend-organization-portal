import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsEditController extends Controller {
  @service store;

  get totalFinancingPercentage() {
    // TODO loop over all involvements and sum the percentages
    let total = 0;

    let involvements = this.model.involvements;

    for (const involvement of involvements.toArray()) {
      total = total + parseFloat(involvement.percentage);
    }

    return total;
  }

  get isFinancingTotalValid() {
    // TODO check if the total is valid
    return this.totalFinancingPercentage != 100;
  }

  setup() {
    if (this.model.involvements.length === 0) {
      this.addNewLocalInvolvement();
    }
  }

  reset() {
    // TODO loop over all involvements and rollback any unsaved changes
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    let involvements = this.model.involvements;

    for (const involvement of involvements.toArray()) {
      if (involvement.isNew) {
        involvement.rollbackAttributes();
      }
    }
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

    let involvements = yield this.model.involvements;

    // TODO check if the total financing percentage is valid before saving

    // TODO loop over all  involvements items and save them
    if (~this.isFinancingTotalValid) {
      for (let involvement of involvements.toArray()) {
        if (involvement.hasDirtyAttributes) {
          yield involvement.save();
        }
      }

      this.router.transitionTo(
        'administrative-units.administrative-unit.local-involvements.index',
        this.model.administrativeUnit.id
      );
    }

    return false;
  }
}
