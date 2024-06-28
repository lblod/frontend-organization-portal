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
  updateMembershipRole(membership, role) {
    membership.role = role;
    // TODO: or member depending on direction of role
    membership.organization = this.model.organization;
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
