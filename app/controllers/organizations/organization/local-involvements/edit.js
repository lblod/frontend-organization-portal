import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { INVOLVEMENT_TYPE } from 'frontend-organization-portal/models/involvement-type';

export default class OrganizationsOrganizationLocalInvolvementsEditController extends Controller {
  @service router;
  @service store;
  @tracked showTotalFinancingPercentageError = false;
  @tracked showMoreThanOneFinancialTypeError = false;

  classificationCodes = [
    CLASSIFICATION_CODE.MUNICIPALITY,
    CLASSIFICATION_CODE.PROVINCE,
  ];

  get hasValidationErrors() {
    let areSomeLocalInvolvementsInvalid = this.model.involvements
      .slice()
      .some((involvement) => involvement.error);

    return (
      areSomeLocalInvolvementsInvalid ||
      !this.isValidTotalFinancingPercentage ||
      !this.isOneOrLessFinancialLocalInvolvement
    );
  }

  get isWorshipService() {
    return this.model.organization.isWorshipService;
  }

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

  get municipalityCode() {
    return CLASSIFICATION_CODE.MUNICIPALITY;
  }

  get isValidTotalFinancingPercentage() {
    let hasFinancialLocalInvolvements = this.model.involvements
      .slice()
      .some((involvement) => involvement.isSupervisory);

    if (hasFinancialLocalInvolvements) {
      return this.totalFinancingPercentage === 100;
    } else {
      return true;
    }
  }

  setup() {
    if (this.model.involvements.length === 0) {
      this.addNewLocalInvolvement();
    }
  }

  reset() {
    this.deleteAllUnsavedLocalInvolvements();
    this.hideTotalFinancingPercentageError();
    this.hideMoreThanOneFinancialTypeError();
  }

  deleteAllUnsavedLocalInvolvements() {
    this.model.involvements
      .filter((involvement) => involvement.isNew)
      .forEach(this.deleteUnsavedLocalInvolvement);
  }

  hideTotalFinancingPercentageError() {
    this.showTotalFinancingPercentageError = false;
  }

  hideMoreThanOneFinancialTypeError() {
    this.showMoreThanOneFinancialTypeError = false;
  }

  @action
  handleInvolvementTypeSelection(involvement, involvementType) {
    involvement.involvementType = involvementType;

    if (
      !involvementType ||
      involvementType.id !== INVOLVEMENT_TYPE.SUPERVISORY
    ) {
      involvement.percentage = 0;
    }

    if (this.isOneOrLessFinancialLocalInvolvement) {
      this.hideMoreThanOneFinancialTypeError();
    }
  }

  @action
  handlePercentageChange(involvement, event) {
    let newPercentage = event.target.value;
    involvement.percentage = newPercentage;

    this.hideTotalFinancingPercentageError();
  }

  get isOneOrLessFinancialLocalInvolvement() {
    let hasFinancialLocalInvolvements = this.model.involvements.filter(
      (involvement) => involvement.isSupervisory
    );
    return hasFinancialLocalInvolvements.length <= 1;
  }

  @action
  addNewLocalInvolvement() {
    let involvement;
    if (this.isWorshipService) {
      involvement = this.store.createRecord('local-involvement', {
        organization: this.model.organization,
        percentage: 0,
      });
    } else {
      involvement = this.store.createRecord('local-involvement', {
        organization: this.model.organization,
        involvementType: this.model.involvementTypes.at(0),
        percentage: 100,
      });
    }

    this.model.involvements.push(involvement);
  }

  @action
  deleteUnsavedLocalInvolvement(involvement) {
    const index = this.model.involvements.indexOf(involvement);
    if (index > -1) {
      this.model.involvements.splice(index, 1);
      involvement.destroyRecord();
    }
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
      .slice()
      .some((involvement) => involvement.error);

    if (!this.isValidTotalFinancingPercentage) {
      this.showTotalFinancingPercentageError = true;
    }
    if (!this.isOneOrLessFinancialLocalInvolvement) {
      this.showMoreThanOneFinancialTypeError = true;
    }

    if (
      !areSomeLocalInvolvementsInvalid &&
      this.isValidTotalFinancingPercentage &&
      this.isOneOrLessFinancialLocalInvolvement
    ) {
      // isDirty was part of ember-changest and is not available in ember-data
      // TODO: After ember update reimplement a way to check for dirty relationships
      // let localInvolvementsWithUnsavedChanges = involvements.filter(
      //   (involvement) => involvement.isDirty
      // );

      let savePromises = involvements.map((involvement) => involvement.save());

      yield Promise.all(savePromises);

      this.router.transitionTo(
        'organizations.organization.local-involvements',
        this.model.organization.id
      );
    }
  }

  isDisabledPercentage(involvement) {
    return !(involvement.isSupervisory || involvement.isMidFinancial);
  }
}
