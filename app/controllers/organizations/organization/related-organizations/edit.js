import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';
import { MEMBERSHIP_ROLES_MAPPING } from 'frontend-organization-portal/models/membership-role';

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
    membership.deleteRecord();
    this.removingFounder = false;
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

    // (Re-)assign the active organisation to the appropriate relation Note:
    // when the label and inverse label are identical, this prioritises setting
    // the active organisation as member. The exceptions are municipalities and
    // central worship services which *currently* always act as organisation in
    // memberships with the "has relation with" role.
    const currentOrganization = this.model.organization;
    if (
      roleLabel === roleModel.opLabel &&
      !(
        membership.role.get('hasRelationWith') &&
        (currentOrganization.isCentralWorshipService ||
          currentOrganization.isMunicipality)
      )
    ) {
      membership.member = currentOrganization;
    } else if (roleLabel === roleModel.inverseOpLabel) {
      membership.organization = currentOrganization;
    }
  }

  @action
  displayRoleLabel(membership) {
    return membership.getRoleLabelForPerspective(this.model.organization);
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    // In case the membership concerns a HAS_RELATION_WITH between a worship
    // service and representative body, make sure the involved organizations
    // are assigned to the correct side of the membership.
    this.memberships = yield Promise.all(
      this.memberships.map(async (membership) => {
        if (
          membership.role.get('id') ===
            MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH.id &&
          membership.organization.get('isRepresentativeBody') &&
          membership.member.get('isWorshipService')
        ) {
          [membership.member, membership.organization] = [
            await membership.organization,
            await membership.member,
          ];
          return membership;
        } else {
          return membership;
        }
      }),
    );

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
