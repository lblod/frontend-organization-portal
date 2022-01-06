import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import localInvolvementValidations from 'frontend-contact-hub/validations/local-involvement';
import { CLASSIFICATION_CODE } from 'frontend-contact-hub/models/administrative-unit-classification-code';
import { INVOLVEMENT_TYPE } from 'frontend-contact-hub/models/involvement-type';

export default class AdministrativeUnitsAdministrativeUnitLocalInvolvementsEditController extends Controller {
  @service router;
  @service store;
  @tracked showTotalFinancingPercentageError = false;

  INVOLVEMENT_TYPE = INVOLVEMENT_TYPE;
  classificationCodes = [
    CLASSIFICATION_CODE.MUNICIPALITY,
    CLASSIFICATION_CODE.PROVINCE,
  ];

  get totalFinancingPercentage() {
    return this.model.involvements.reduce((percentageTotal, involvement) => {
      let percentage = parseFloat(involvement.percentage);

      let isValidPercentage = !Number.isNaN(percentage);

      if (isValidPercentage) {
        return percentageTotal + percentage;
      } else {
        return percentageTotal;
      }
    }, 0);
  }

  get isValidTotalFinancingPercentage() {
    return this.totalFinancingPercentage === 100;
  }

  setup() {
    if (this.model.involvements.length === 0) {
      this.addNewLocalInvolvement();
    }
  }

  reset() {
    this.deleteAllUnsavedLocalInvolvements();
    this.hideTotalFinancingPercentageError();
  }

  deleteAllUnsavedLocalInvolvements() {
    this.model.involvements
      .filter((involvement) => involvement.isNew)
      .forEach(this.deleteUnsavedLocalInvolvement);
  }

  hideTotalFinancingPercentageError() {
    this.showTotalFinancingPercentageError = false;
  }

  @action
  handleInvolvementTypeSelection(involvement, involvementType) {
    involvement.involvementType = involvementType;

    if (!involvementType || involvementType.id !== INVOLVEMENT_TYPE.FINANCIAL) {
      involvement.percentage = 0;
    }
  }

  @action
  handlePercentageChange(involvement, event) {
    let newPercentage = event.target.value;
    involvement.percentage = newPercentage;

    this.hideTotalFinancingPercentageError();
  }

  @action
  addNewLocalInvolvement() {
    let involvement = this.store.createRecord('local-involvement', {
      worshipService: this.model.administrativeUnit,
      percentage: 0,
    });

    this.model.involvements.pushObject(
      createValidatedChangeset(involvement, localInvolvementValidations)
    );
  }

  @action
  deleteUnsavedLocalInvolvement(involvement) {
    this.model.involvements.removeObject(involvement);
    involvement.destroyRecord();
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let involvements = yield this.model.involvements;

    let validationPromises = involvements.map((involvement) =>
      involvement.validate()
    );
    yield Promise.all(validationPromises);

    let areSomeLocalInvolvementsInvalid = involvements
      .toArray()
      .some((involvement) => involvement.isInvalid);

    if (!this.isValidTotalFinancingPercentage) {
      this.showTotalFinancingPercentageError = true;
    }

    if (
      !areSomeLocalInvolvementsInvalid &&
      this.isValidTotalFinancingPercentage
    ) {
      let localInvolvementsWithUnsavedChanges = involvements.filter(
        (involvement) => involvement.isDirty
      );

      let savePromises = localInvolvementsWithUnsavedChanges.map(
        (involvement) => involvement.save()
      );

      yield Promise.all(savePromises);

      this.router.transitionTo(
        'administrative-units.administrative-unit.local-involvements',
        this.model.administrativeUnit.id
      );
    }
  }
}
