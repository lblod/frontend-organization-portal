import { belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
} from '../validators/schema';
import { MEMBERSHIP_ROLES_MAPPING } from './membership-role';

export default class MembershipModel extends AbstractValidationModel {
  @belongsTo('organization', {
    inverse: 'membershipsOfOrganizations',
    async: true,
    polymorphic: true,
    as: 'membership',
  })
  member;

  @belongsTo('organization', {
    inverse: 'memberships',
    async: true,
    polymorphic: true,
    as: 'membership',
  })
  organization;

  @belongsTo('membership-role', {
    inverse: null,
    async: true,
  })
  role;

  @belongsTo('period-of-time', {
    inverse: null,
    async: true,
  })
  during;

  get validationSchema() {
    const REQUIRED_MESSAGE = 'Selecteer een optie';
    return Joi.object({
      member: validateBelongsToRequired(REQUIRED_MESSAGE),
      organization: validateBelongsToRequired(REQUIRED_MESSAGE),
      role: Joi.when(Joi.ref('$creatingNewOrganization'), {
        // Notes:
        // - The requested functionality was to *not* perform validations when
        //   editing the memberships of already existing organisations. The
        //   extra validations below are only sufficient in the context of the
        //   new organisation form in which the classification of the related
        //   organisation is enforced by the form. The above
        //   `creatingNewOrganization` allows us to specify whether the extra
        //   validations should be performed:
        //     ```
        //     someMembership.validate({creatingNewOrganization: true})
        //     ```
        // - If this validation is used during editing: For OCMW associations
        //   and PEVAs a founding organisation is normally mandatory. But the
        //   available business data when onboarding them was incomplete in this
        //   respect. Therefore, we opted to relax this rule for the OCMW
        //   associations and PEVAs imported during the onboarding. Due to the
        //   above note this relaxation comes automatically, but if/when the
        //   validations are also performed during editing this should again be
        //   taken into account.
        is: Joi.exist().valid(true),
        then: validateBelongsToRequired(REQUIRED_MESSAGE).external(
          async (value, helpers) => {
            const organization = await this.organization;
            // NOTE: do not rely on IDs as this is dealing with not yet
            // persisted resources
            const allMemberships = await organization.memberships;

            let roles = [];

            if (organization.isIgs) {
              roles.push(MEMBERSHIP_ROLES_MAPPING.PARTICIPATES_IN);
            }

            if (
              organization.isApb ||
              organization.isAgb ||
              organization.isOcmwAssociation ||
              organization.isPevaMunicipality ||
              organization.isPevaProvince
            ) {
              roles.push(MEMBERSHIP_ROLES_MAPPING.IS_FOUNDER_OF);
            }

            if (
              organization.isApb ||
              organization.isIgs ||
              organization.isPoliceZone ||
              organization.isAssistanceZone ||
              organization.isWorshipService ||
              organization.isCentralWorshipService
            ) {
              roles.push(MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH);
            }

            if (!this.#containsMembershipForRoles(allMemberships, roles)) {
              return helpers.message('Selecteer een optie');
            }

            return value;
          },
        ),
        otherwise: validateBelongsToRequired(REQUIRED_MESSAGE),
      }),
      during: validateBelongsToOptional(),
    });
  }

  #containsMembershipForRoles(memberships, roles) {
    return roles.every((role) =>
      memberships.some((membership) => membership.role.id === role.id),
    );
  }

  /**
   * Get the label of the role as it should be read from the perspective of a
   * specific organization. For example, a membership with a participation role
   * from the member perspective should result in 'Participeert in', while from
   * the organization perspective it is 'Heeft als participanten'.
   * @param {{@link OrganizationModel}} organization - The organization whose
   *     perspective should be taken.
   * @returns {string} The role label as read from the perspective of the
   *     provided organization.
   */
  getRoleLabelForPerspective(organization) {
    if (this.role) {
      if (this.member?.id === organization.id) {
        return this.role.get('opLabel');
      }
      if (this.organization?.id === organization.id) {
        return this.role.get('inverseOpLabel');
      }
    }
  }

  get isHasRelationWithMembership() {
    return this.role?.get('hasRelationWith');
  }

  get isFounderOfMembership() {
    return this.role?.get('isFounderOf');
  }

  get isParticipatesMembership() {
    return this.role?.get('participatesIn');
  }

  get isNotRemovableByUser() {
    const org = this.belongsTo('organization').value();
    const member = this.belongsTo('member').value();
    const role = this.belongsTo('role').value();

    return (
      role?.hasRelationWith &&
      ((org?.isProvince && member?.isMunicipality) ||
        (org?.isProvince && member?.isOCMW) ||
        (org?.isMunicipality && member?.isOCMW))
    );
  }

  /**
   * Check whether this membership is equal to a given one. Two memberships are
   * considered equal their respective organizations, members, and roles have
   * the same id.
   * @param {MembershipModel} membership - The membership to compare with.
   * @return True if this membership are equal, false otherwise.
   */
  equals(membership) {
    return (
      this.organization.id === membership.organization.id &&
      this.member.id === membership.member.id &&
      this.role.id === membership.role.id
    );
  }
}
