import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  query as queryBuilder,
  saveRecord,
} from '@warp-drive/legacy/compat/builders';
import {
  removingMembershipBreaksMinimum,
  shouldSwapAssignments,
} from 'frontend-organization-portal/constants/memberships';

export default class OrganizationsOrganizationRelatedOrganizationsEditController extends Controller {
  @service router;
  @service store;

  queryParams = ['page', 'size', 'selectedRoleLabel'];

  @tracked page = 0;
  @tracked size = 500;

  @tracked memberships;
  @tracked selectedRoleLabel;

  @tracked founderToRemove;

  @tracked membershipRemovalError;

  @tracked nonActiveMembership;
  @tracked nonActiveRelatedOrganization;

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
      this.memberships = this.model.memberships.map((e) => e);
    }
    if (this.memberships.length === 0) {
      this.addMembership();
    }
  }

  @action
  addMembership() {
    let membership = this.store.createRecord('membership');
    this.memberships = [...this.memberships, membership];
  }

  @action
  async removeMembership(membership) {
    // The organization being edited must keep meeting the minimum of the
    // field the membership belongs to.
    if (
      removingMembershipBreaksMinimum(
        membership,
        this.model.organization,
        this.memberships ?? [],
      )
    ) {
      this.membershipRemovalError = this.#removalErrorFor('je organisatie');
      return;
    }

    // The organization on the other side of the membership must keep meeting
    // its minimums as well. Its memberships are not on this page, so they are
    // fetched here.
    const otherOrganization = this.#otherOrganizationOf(membership);
    if (otherOrganization) {
      const otherMemberships =
        await this.#fetchMembershipsOf(otherOrganization);
      if (
        otherMemberships &&
        removingMembershipBreaksMinimum(
          membership,
          otherOrganization,
          otherMemberships,
        )
      ) {
        this.membershipRemovalError = this.#removalErrorFor(
          otherOrganization.abbName,
        );
        return;
      }
    }

    this.founderToRemove = membership;
  }

  @action
  cancelMembershipRemoval() {
    this.founderToRemove = undefined;
  }

  @action
  dismissMembershipRemovalError() {
    this.membershipRemovalError = null;
  }

  /**
   * The organization on the other side of the given membership. `null` for a
   * row that was added but never filled in completely.
   */
  #otherOrganizationOf(membership) {
    const organization = this.model.organization;
    return membership.belongsTo('member').value() === organization
      ? membership.belongsTo('organization').value()
      : membership.belongsTo('member').value();
  }

  /**
   * The persisted memberships of the given organization, on both the
   * `organization` and the `member` side. `null` if they could not be loaded:
   * the page size matches the one this page loads for the organization being
   * edited.
   */
  async #fetchMembershipsOf(organization) {
    try {
      const { content } = await this.store.request(
        queryBuilder('membership', {
          'filter[:or:][member][:id:]': organization.id,
          'filter[:or:][organization][:id:]': organization.id,
          include:
            'role,member,organization,member.classification,organization.classification',
          page: { size: 500, number: 0 },
        }),
      );
      return content;
    } catch {
      // Without the memberships the minimum of the other organization cannot
      // be checked. Allow the removal in that case, as it was before the
      // other side of a removal was checked at all.
      return null;
    }
  }

  #removalErrorFor(organizationName) {
    return `Je kan deze relatie niet verwijderen omdat ${organizationName} anders onder het vereiste minimum aantal relaties van dit type komt.`;
  }

  @action
  reallyRemoveMembership(membership) {
    // NOTE (28/02/2025): If `this.founderToRemove` is set the call comes via
    // the confirmation modal, in that case ignore any value provided for
    // `membership`.
    if (this.founderToRemove) {
      membership = this.founderToRemove;
    }
    // NOTE The `save` function below depends on the contents of the
    // memberships array to persist the necessary changes:
    // - do *not* remove any already persisted memberships from the array as
    //   this will cause their deletion to "forgotten" in the `save` function.
    // - do remove newly added memberships that have not been persisted yet.
    //   Otherwise, they can result in failing validations or errors.
    if (membership.isNew) {
      this.memberships = this.memberships.filter((m) => m !== membership);
      membership.deleteRecord();
      membership.unloadRecord();
    } else {
      membership.deleteRecord();
    }
    this.founderToRemove = undefined;
  }

  @action
  setRelatedOrganizationMembership(membership, organization) {
    if (organization.isActive) {
      this.#setOtherMembershipResource(membership, organization);
    } else {
      this.nonActiveMembership = membership;
      this.nonActiveRelatedOrganization = organization;
    }
  }

  @action
  confirmNonActiveRelatedOrganization() {
    this.#setOtherMembershipResource(
      this.nonActiveMembership,
      this.nonActiveRelatedOrganization,
    );
    this.nonActiveMembership = undefined;
    this.nonActiveRelatedOrganization = undefined;
  }

  @action
  cancelNonActiveRelatedOrganization() {
    this.#setOtherMembershipResource(this.nonActiveMembership, undefined);
    this.nonActiveMembership = undefined;
    this.nonActiveRelatedOrganization = undefined;
  }

  #setOtherMembershipResource(membership, organization) {
    if (membership.member.id === this.model.organization.id) {
      membership.organization = organization;
    } else {
      membership.member = organization;
    }
  }

  /**
   * Whether none of the member, organization, or role have been set yet, as
   * is the case for a row that was just added but never filled in by the
   * user.
   */
  #isEmptyMembership(membership) {
    const org = membership.belongsTo('organization').value();
    const member = membership.belongsTo('member').value();
    const role = membership.belongsTo('role').value();

    return !org && !member && !role;
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

  save = dropTask(async (event) => {
    event.preventDefault();

    this.memberships = this.memberships.filter((membership) => {
      if (membership.isNew && this.#isEmptyMembership(membership)) {
        membership.deleteRecord();
        membership.unloadRecord();
        return false;
      }
      return true;
    });

    let organization = this.model.organization;
    await organization.validate();

    let validationPromises = this.memberships.map((membership) =>
      membership.validate(),
    );
    await Promise.all(validationPromises);

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
      this.memberships = await Promise.all(
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

      let savePromises = this.memberships.map((membership) =>
        this.store.request(saveRecord(membership)),
      );
      await Promise.all(savePromises);

      await this.store.request(saveRecord(organization));

      this.router.transitionTo(
        'organizations.organization.related-organizations',
        organization.id,
      );
    }
  });

  reset() {
    this.#rollbackMemberships();
    this.model.organization.reset();
    this.memberships = null;
    this.selectedRoleLabel = null;
    this.founderToRemove = null;
    this.membershipRemovalError = null;
    this.nonActiveMembership = null;
    this.nonActiveRelatedOrganization = null;
  }

  /**
   * Undo the unsaved changes: restore the persisted memberships that were
   * removed and unload the ones that were added. Memberships whose save is
   * still in flight are left alone (this also runs on every exit of the
   * route, including after a save).
   */
  #rollbackMemberships() {
    const memberships = this.memberships?.slice() ?? [];
    memberships.forEach((membership) => {
      if (
        membership.isDestroyed ||
        membership.isDestroying ||
        membership.isSaving
      ) {
        return;
      }
      // `hasDirtyAttributes` is also true for an uncommitted deletion
      if (membership.isNew || membership.hasDirtyAttributes) {
        membership.rollbackAttributes();
      }
    });
  }
}
