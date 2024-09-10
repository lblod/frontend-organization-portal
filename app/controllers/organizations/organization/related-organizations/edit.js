import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import { allowedHasRelationWithMemberships } from 'frontend-organization-portal/constants/memberships';

export default class OrganizationsOrganizationRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  queryParams = ['page', 'size', 'selectedRoleLabel'];

  @tracked page = 0;
  @tracked size = 500;

  @tracked memberships;
  @tracked selectedRoleLabel;

  @tracked removingFounder = false;

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
    if (membership.role.id === MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF.id) {
      this.removingFounder = true;
    } else {
      this.reallyRemoveMembership(membership);
    }
  }

  @action
  cancelMembershipRemoval() {
    this.removingFounder = false;
  }

  @action
  reallyRemoveMembership(membership) {
    // Note, The `save` function below depends on the contents of the
    // memberships array to persist the necessary changes:
    // - do *not* remove any already persisted memberships from the array as
    //   this will cause their deletion to "forgotten" in the `save` function.
    // - do remove newly added memberships that have not been persisted yet.
    //   Otherwise, they can result in failing validations or errors.
    if (membership.isNew) {
      this.memberships.removeObject(membership);
      membership.destroyRecord();
    } else {
      membership.deleteRecord();
    }
    this.removingFounder = false;
  }

  @action
  updateMembershipRole(membership, roleLabel) {
    // Remove any previous assignments
    membership.member = null;
    membership.organization = null;

    // Find the role model matching the label
    // Note: this assumes that each different membership role has unique labels
    const roleModel = this.model.roles.find(
      (r) => r.opLabel === roleLabel || r.inverseOpLabel === roleLabel,
    );
    membership.role = roleModel;

    const currentOrganization = this.model.organization;
    if (
      membership.role.get('id') !==
      MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id
    ) {
      // Determine the correct assignment for the current organization based on
      // "direction" of the label.  This implies that the user decides who
      // becomes the `member` and `organization` by selecting the right label.
      if (roleLabel === roleModel.opLabel) {
        membership.member = currentOrganization;
      } else if (roleLabel === roleModel.inverseOpLabel) {
        membership.organization = currentOrganization;
      }
    } else {
      // For "has relation with" memberships, assign the current organization
      // according to the configuration of allowed relations.  For the user a
      // "has a relation with" has no direction, we do enforce one to ensure
      // consistent data.
      let orgClasses = allowedHasRelationWithMemberships.flatMap(
        (e) => e.organizations,
      );
      let currentOrgClass = currentOrganization.classification.get('id');
      if (orgClasses.includes(currentOrgClass)) {
        membership.organization = currentOrganization;
      } else {
        membership.member = currentOrganization;
      }
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
    this.removingFounder = false;
  }
}
