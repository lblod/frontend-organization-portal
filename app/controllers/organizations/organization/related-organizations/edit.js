import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';
import { shouldSwapAssignments } from 'frontend-organization-portal/constants/memberships';

export default class OrganizationsOrganizationRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  queryParams = ['page', 'size', 'selectedRoleLabel'];

  @tracked page = 0;
  @tracked size = 500;

  @tracked memberships;
  @tracked selectedRoleLabel;

  @tracked founderToRemove;

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
      this.founderToRemove = membership;
    } else {
      this.reallyRemoveMembership(membership);
    }
  }

  @action
  cancelMembershipRemoval() {
    this.founderToRemove = undefined;
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
    this.founderToRemove = false;
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

    // Determine the correct assignment for the current organization based on
    // "direction" of the label.  This implies that the user decides who
    // becomes the `member` and `organization` by selecting the right label.
    // Note, for memberships with the "has a relation with" role, the 'right'
    // assignment depends on the classification of the other involved
    // organization and it will be corrected, if necessary, upon saving the
    // membership.
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
      // Filter duplicate memberships, this means memberships that have the same
      // member, organization, and role.
      // Note: Do *not* move this filtering earlier in the function, that
      // results in nasty interactions/errors when a validation fails.
      this.memberships = this.memberships.filter(
        (membership, index, memberships) =>
          index === memberships.findIndex((m) => membership.equals(m)),
      );

      // For "has relation with" memberships, assign the current organization
      // according to the configuration of allowed relations. For the user a "has
      // a relation with" has no direction, but we do enforce one to ensure
      // consistent data.
      // Notes:
      // - The form ensures that the user cannot select organizations kinds
      //   that would result in a disallowed relation. So at this point each
      //   membership should have valid involved organizations, except that the
      //   `member` and `organization` may need to be swapped.
      // - Currently the membership validations only check whether required
      //   values are present, not whether the memberships are correct allowed,
      //   see notes in `membership.validationSchema`. If this changes any swap
      //   should be performed validation.
      this.memberships = yield Promise.all(
        this.memberships.map(async (membership) => {
          if (
            membership.isHasRelationWithMembership &&
            shouldSwapAssignments(membership) &&
            membership.isNew
          ) {
            [membership.member, membership.organization] = [
              await membership.organization,
              await membership.member,
            ];
          }
          return membership;
        }),
      );

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
    this.founderToRemove = null;
  }
}
