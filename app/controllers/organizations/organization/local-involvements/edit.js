import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { INVOLVEMENT_TYPE } from 'frontend-organization-portal/models/involvement-type';

export default class OrganizationsOrganizationLocalInvolvementsEditController extends Controller {
  @service router;
  @service store;

  @tracked localInvolvementToConfirm;
  @tracked nonActiveInvolvedOrganization;

  get hasValidationErrors() {
    return (
      this.model.organization.error ||
      this.model.involvements.slice().some((involvement) => involvement.error)
    );
  }

  setup() {
    if (this.model.involvements.length === 0) {
      this.addNewLocalInvolvement();
    }
  }

  reset() {
    this.deleteAllUnsavedLocalInvolvements();
    this.model.involvements.map((involvement) => involvement.reset());
    this.model.organization.reset();

    this.localInvolvementToConfirm = undefined;
    this.nonActiveInvolvedOrganization = undefined;
  }

  deleteAllUnsavedLocalInvolvements() {
    this.model.involvements
      .filter((involvement) => involvement.isNew)
      .forEach(this.deleteUnsavedLocalInvolvement);
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
  }

  @action
  addNewLocalInvolvement() {
    let involvement;

    if (this.model.organization.isWorshipService) {
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
  setInvolvedOrganization(involvement, organization) {
    if (!organization || organization.isActive) {
      involvement.administrativeUnit = organization;
    } else {
      this.#setNonActiveLocalInvolvement(involvement, organization);
    }
  }

  @action
  confirmSetInvolvedOrganization(involvement) {
    if (this.hasNonActiveInvolvement) {
      involvement = this.localInvolvementToConfirm;
    }
    involvement.administrativeUnit = this.nonActiveInvolvedOrganization;

    this.#setNonActiveLocalInvolvement();
  }

  @action
  cancelSetInvolvedOrganization(involvement) {
    if (this.hasNonActiveInvolvement) {
      involvement = this.localInvolvementToConfirm;
    }
    involvement.administrativeUnit = undefined;

    this.#setNonActiveLocalInvolvement();
  }

  #setNonActiveLocalInvolvement(involvement, organization) {
    this.localInvolvementToConfirm = involvement;
    this.nonActiveInvolvedOrganization = organization;
  }

  get hasNonActiveInvolvement() {
    return this.localInvolvementToConfirm && this.nonActiveInvolvedOrganization;
  }

  @action
  deleteUnsavedLocalInvolvement(involvement) {
    const index = this.model.involvements.indexOf(involvement);
    if (index > -1) {
      this.model.involvements.splice(index, 1);
      involvement.destroyRecord();
    }
  }

  @action
  handlePercentageChange(involvement, event) {
    let newPercentage = event.target.value;
    involvement.percentage = newPercentage;
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let involvements = yield this.model.involvements;

    let validationPromises = involvements.map((involvement) =>
      involvement.validate(),
    );
    validationPromises.push(
      this.model.organization.validate({ involvementsPercentage: true }),
    );
    yield Promise.all(validationPromises);

    if (!this.hasValidationErrors) {
      // isDirty was part of ember-changest and is not available in ember-data
      // TODO: After ember update reimplement a way to check for dirty relationships
      // let localInvolvementsWithUnsavedChanges = involvements.filter(
      //   (involvement) => involvement.isDirty
      // );

      let savePromises = involvements.map((involvement) => involvement.save());

      yield Promise.all(savePromises);

      this.router.transitionTo(
        'organizations.organization.local-involvements',
        this.model.organization.id,
      );
    }
  }

  isDisabledPercentage(involvement) {
    return !(involvement.isSupervisory || involvement.isMidFinancial);
  }
}
