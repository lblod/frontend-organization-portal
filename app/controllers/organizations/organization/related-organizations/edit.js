import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class OrganizationsOrganizationRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  queryParams = ['sort', 'page', 'size', 'organizationStatus'];

  @tracked sort = 'role.label';
  @tracked page = 0;
  @tracked size = 25;
  @tracked organizationStatus = true;

  @tracked memberships;

  removedMemberships = [];

  get hasValidationErrors() {
    return (
      this.model.organization.error ||
      this.memberships.some((membership) => membership.error)
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
    // TODO: do not remove if membership concerns founding
    this.memberships.removeObject(membership);
    // // TODO: use isDeleted flag?
    this.removedMemberships.push(membership);
  }

  @action
  updateMembershipRole(membership, roleLabel) {
    // Remove any previously set value
    // TODO: deal with any set organization?
    if (membership.member.id === this.model.organization.id) {
      membership.member = null;
    }
    if (membership.organization.id === this.model.organization.id) {
      membership.organization = null;
    }

    const roleModel = this.model.roles.find(
      (r) => r.opLabel === roleLabel || r.inverseOpLabel === roleLabel
    );
    membership.role = roleModel;

    if (roleLabel === roleModel.opLabel) {
      membership.member = this.model.organization;
    }
    if (roleLabel === roleModel.inverseOpLabel) {
      membership.organization = this.model.organization;
    }
  }

  @action
  displayRoleLabel(membership) {
    return membership.getRoleLabelForPerspective(this.model.organization);
  }

  // TODO: deal with duplicated general membership
  get roleOptions() {
    const result = [];
    this.model.roles.forEach((role) => {
      result.push(role.opLabel);
      result.push(role.inverseOpLabel);
    });

    return result;
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let organization = this.model.organization;

    // TODO: commented as it complains about missing organization status
    //yield organization.validate({ relaxMandatoryFoundingOrganization: true });

    let validationPromises = this.memberships.map((membership) =>
      membership.validate()
    );
    yield Promise.all(validationPromises);

    if (!this.hasValidationErrors) {
      let savePromises = this.memberships.map((membership) => {
        membership.save();
      });
      yield Promise.all(savePromises);

      this.removedMemberships.forEach((membership) =>
        membership.destroyRecord()
      );

      yield organization.save();

      this.router.transitionTo(
        'organizations.organization.related-organizations',
        organization.id
      );
    }
  }

  reset() {
    this.model.organization.reset();
    this.memberships = null;
  }
}
