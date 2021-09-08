import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsEditController extends Controller {
  @service router;
  @service store;

  INVOLVEMENT_TYPE = {
    FINANCIAL: 'ac400cc9f135ac7873fb3e551ec738c1',
  };

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
      if (involvement.hasDirtyAttributes) {
        involvement.rollbackAttributes();
      }
    }
  }

  @action
  handleInvolvementTypeSelection(involvement, involvementType) {
    involvement.involvementType = involvementType;

    if (involvementType.id !== this.INVOLVEMENT_TYPE.FINANCIAL) {
      involvement.percentage = 0;
    }
  }

  @action
  addNewLocalInvolvement() {
    this.model.involvements.pushObject(
      this.store.createRecord('local-involvement', {
        worshipService: this.model.administrativeUnit,
        percentage: 0,
      })
    );
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    if (this.isFinancingTotalNotValid) {
      return;
    }

    let involvements = yield this.model.involvements;

    let savePromises = involvements.map((involvement) => involvement.save());
    yield Promise.all(savePromises);

    this.router.transitionTo(
      'administrative-units.administrative-unit.local-involvements',
      this.model.administrativeUnit.id
    );
  }
}
