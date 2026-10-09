import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { recordIdentifierFor } from '@warp-drive/core';
import { saveRecord } from '@warp-drive/legacy/compat/builders';
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

  @tracked nonActiveMembership;
  @tracked nonActiveRelatedOrganization;

  get hasValidationErrors() {
    // Removed rows are hidden, so their errors can never be shown; they are
    // deleted regardless of their fields and must not block the save.
    return this.memberships.some(
      (membership) =>
        !membership.isDeleted &&
        (membership.error || membership.belongsTo('during').value()?.error),
    );
  }

  get hasUnsavedEdits() {
    return this.memberships.some((membership) => {
      const period = membership.belongsTo('during').value();
      return (
        membership.isNew ||
        membership.isDeleted ||
        period?.isNew ||
        period?.hasDirtyAttributes
      );
    });
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
  removeMembership(membership) {
    this.founderToRemove = membership;
  }

  @action
  cancelMembershipRemoval() {
    this.founderToRemove = undefined;
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
      this.#rollbackPeriod(membership);
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

  @action
  setStartDate(membership, date) {
    this.#setPeriodDate(membership, 'startDate', date);
  }

  @action
  setEndDate(membership, date) {
    this.#setPeriodDate(membership, 'endDate', date);
  }

  // Creates the period on the first date; clearing a date of a membership
  // without period changes nothing
  #setPeriodDate(membership, field, date) {
    let period = membership.belongsTo('during').value();
    if (!period) {
      if (!date) {
        return;
      }
      period = this.store.createRecord('period-of-time');
      membership.during = period;
    }
    period[field] = date;
  }

  // A row that was added but never filled in
  #isEmptyMembership(membership) {
    const org = membership.belongsTo('organization').value();
    const member = membership.belongsTo('member').value();
    const role = membership.belongsTo('role').value();
    const period = membership.belongsTo('during').value();

    return !org && !member && !role && (!period || period.isEmpty);
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
        this.#rollbackPeriod(membership);
        membership.deleteRecord();
        membership.unloadRecord();
        return false;
      }
      return true;
    });

    let organization = this.model.organization;
    await organization.validate();

    let validationPromises = this.memberships.map(async (membership) => {
      const period = membership.belongsTo('during').value();
      if (membership.isDeleted) {
        // A removed row is deleted together with its period, so neither needs
        // validating; clear the errors left by an earlier save attempt.
        membership.resetErrors();
        period?.resetErrors();
        return;
      }
      await membership.validate();
      await period?.validate();
    });
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

      await Promise.all(
        this.memberships.map((membership) => this.#saveMembership(membership)),
      );

      await this.store.request(saveRecord(organization));

      this.router.transitionTo(
        'organizations.organization.related-organizations',
        organization.id,
      );
    }
  });

  /**
   * A removed membership is deleted before its period. Otherwise the period is
   * saved first (the link needs a persisted period) and the membership only
   * when it is new or its period is not linked yet.
   */
  async #saveMembership(membership) {
    const period = membership.belongsTo('during').value();

    if (membership.isDeleted) {
      await this.store.request(saveRecord(membership));
      if (period?.isNew) {
        // Never saved, so there is nothing to delete
        period.rollbackAttributes();
      } else if (period) {
        period.deleteRecord();
        await this.store.request(saveRecord(period));
      }
      return;
    }

    let mustSaveMembership = membership.isNew;
    let linkedPeriod = null;

    if (period?.isNew) {
      if (period.isEmpty) {
        // The user did not enter any dates, do not persist an empty period
        membership.during = null;
        period.rollbackAttributes();
      } else {
        await this.store.request(saveRecord(period));
        linkedPeriod = period;
      }
    } else if (period) {
      if (period.hasDirtyAttributes) {
        await this.store.request(saveRecord(period));
      }
      linkedPeriod = period;
    }

    if (linkedPeriod && !mustSaveMembership) {
      // Decide on the persisted link, not on `period.isNew`: after a save that
      // failed on the membership request the period is already persisted
      // while the membership is still unlinked on the server.
      const remote = this.store.cache.getRemoteRelationship(
        recordIdentifierFor(membership),
        'during',
      );
      mustSaveMembership = remote.data?.id !== linkedPeriod.id;
    }

    if (mustSaveMembership) {
      await this.store.request(saveRecord(membership));
    }
  }

  reset() {
    this.#rollbackPeriods();
    this.#rollbackMemberships();
    this.model.organization.reset();
    this.memberships = null;
    this.selectedRoleLabel = null;
    this.founderToRemove = null;
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
        membership.reset();
      } else {
        // Clear the errors of a failed save
        membership.resetErrors();
      }
    });
  }

  /**
   * Undo the unsaved changes to the periods, before the memberships are rolled
   * back (the period of an unloaded membership is no longer reachable).
   */
  #rollbackPeriods() {
    const memberships = this.memberships?.slice() ?? [];
    memberships.forEach((membership) => {
      if (membership.isDestroyed || membership.isDestroying) {
        return;
      }
      this.#rollbackPeriod(membership);
    });
  }

  #rollbackPeriod(membership) {
    const period = membership.belongsTo('during').value();
    if (!period || period.isDestroyed || period.isDestroying) {
      return;
    }
    if (membership.isSaving || period.isSaving) {
      return;
    }
    if (period.isNew) {
      if (!membership.isNew) {
        // Unlink the never saved period from the persisted membership
        this.store.cache.rollbackRelationships(recordIdentifierFor(membership));
      }
      period.reset();
    } else if (period.hasDirtyAttributes) {
      period.reset();
    } else {
      // Clear the errors of a failed save
      period.resetErrors();
    }
  }
}
