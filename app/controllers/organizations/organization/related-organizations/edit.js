import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class OrganizationsOrganizationRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  queryParams = ['page', 'size', 'selectedRoleLabel'];

  @tracked page = 0;
  @tracked size = 500;

  @tracked memberships;
  @tracked selectedRoleLabel;

  get hasValidationErrors() {
    return this.memberships.some((membership) => membership.error);
  }

  get hasUnsavedEdits() {
    return this.memberships.some(
      (membership) => membership.isNew || membership.isDeleted,
    );
  }

  setup() {
    if (!this.memberships) {
      // Note: use EmberArray since this variable is tracked
      this.memberships = A(this.model.memberships.map((e) => e));
    }
    if (this.memberships.length === 0) {
      this.addMembership();
    }
  }

  @action
  addMembership() {
    let membership = this.store.createRecord('membership');
    this.memberships.pushObject(membership);
  }

  @action
  removeMembership(membership) {
    // TODO: display warning when membership concerns founding
    membership.deleteRecord();
  }

  @action
  updateMembershipRole(membership, roleLabel) {
    // Remove any previously assigned relations
    membership.member = null;
    membership.organization = null;

    // Find the role model matching the label
    // Note: this assumes that the labels are unique for each membership role
    const roleModel = this.model.roles.find(
      (r) => r.opLabel === roleLabel || r.inverseOpLabel === roleLabel,
    );
    membership.role = roleModel;

    // (Re-)assign the active organisation to the appropriate relation
    // Note: when the label and inverse label are identical, this prioritises
    // setting the active organisation as member
    if (roleLabel === roleModel.opLabel) {
      membership.member = this.model.organization;
    } else if (roleLabel === roleModel.inverseOpLabel) {
      membership.organization = this.model.organization;
    }
  }

  @action
  displayRoleLabel(membership) {
    return membership.getRoleLabelForPerspective(this.model.organization);
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let organization = this.model.organization;

    yield organization.validate();

    let validationPromises = this.memberships.map((membership) =>
      membership.validate(),
    );
    yield Promise.all(validationPromises);

    if (!this.hasValidationErrors) {
      let savePromises = this.memberships.map((membership) => {
        membership.save();
      });
      yield Promise.all(savePromises);

      yield organization.save();

      this.router.transitionTo(
        'organizations.organization.related-organizations',
        organization.id,
      );
    }
  }

  reset() {
    this.model.organization.reset();
    this.memberships = null;
    this.selectedRoleLabel = null;
  }
}
