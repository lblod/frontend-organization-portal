import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';

const INVOLVEMENT_TYPE = {
  FINANCIAL: 'ac400cc9f135ac7873fb3e551ec738c1',
};

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsEditController extends Controller {
  @service router;
  @service store;

  @tracked selectedInvolvementType;

  get totalFinancingPercentage() {
    let total = 0;

    let involvements = this.model.involvements;

    for (const involvement of involvements.toArray()) {
      total = total + parseFloat(involvement.percentage);
    }

    return total;
  }

  get isFinancingTotalNotValid() {
    return this.totalFinancingPercentage !== 100;
  }

  get isNotFinancialType() {
    return this.selectedInvolvementType?.id !== INVOLVEMENT_TYPE.FINANCIAL;
  }

  @action
  async handleInvolvimentTypeSelect(involvementType) {
    this.selectedInvolvementType = involvementType;
  }

  setup() {
    if (this.model.involvements.length === 0) {
      this.addNewLocalInvolvement();
    }
  }

  reset() {
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

    if (~this.isFinancingTotalNotValid) {
      for (let involvement of involvements.toArray()) {
        if (involvement.hasDirtyAttributes) {
          yield involvement.save();
        }
      }

      this.router.transitionTo(
        'administrative-units.administrative-unit.local-involvements',
        this.model.administrativeUnit.id
      );
    }

    return false;
  }
}
