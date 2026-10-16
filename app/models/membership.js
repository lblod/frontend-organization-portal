import { belongsTo } from '@warp-drive/legacy/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
} from '../validators/schema';
import { MEMBERSHIP_ROLES_MAPPING } from './membership-role';
import { SPECIAL_RELATED_ORGANIZATION_IDS } from 'frontend-organization-portal/constants/special-organizations';
import {
  getUnsatisfiedRequiredField,
  minimumRequiredFieldMessage,
} from '../utils/membership-rules';

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
        // - Which fields are mandatory per type is defined in
        //   `membershipFieldsByClassification` (constants/memberships.js),
        //   with the validation logic in `utils/membership-rules.js`.
        is: Joi.exist().valid(true),
        then: validateBelongsToRequired(REQUIRED_MESSAGE).external(
          async (value, helpers) => {
            // The organization being created is the one that is not
            // persisted yet; the picked organizations are.
            const organization = await this.organization;
            const member = await this.member;
            const newOrganization =
              member?.isNew && !organization?.isNew ? member : organization;

            if (!newOrganization?.isNew) {
              return value;
            }

            // NOTE: do not rely on IDs as this is dealing with not yet
            // persisted resources
            const allMemberships = [
              ...(await newOrganization.memberships),
              ...(await newOrganization.membershipsOfOrganizations),
            ];

            let roles = [];

            if (
              newOrganization.isWorshipService ||
              newOrganization.isCentralWorshipService
            ) {
              roles.push(MEMBERSHIP_ROLES_MAPPING.HAS_RELATION_WITH);
            }

            if (!this.#containsMembershipForRoles(allMemberships, roles)) {
              return helpers.message('Selecteer een optie');
            }

            const unsatisfiedField = getUnsatisfiedRequiredField(
              newOrganization,
              allMemberships,
            );
            if (unsatisfiedField) {
              return helpers.message(
                minimumRequiredFieldMessage(
                  unsatisfiedField,
                  newOrganization.classification?.get('id'),
                ),
              );
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
   * from the member perspective should result in 'Is lid van', while from
   * the organization perspective it is 'Heeft als leden'.
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

  get isServesMembership() {
    return this.role?.get('serves');
  }

  get isGrantsRecognitionMembership() {
    return this.role?.get('grantsRecognition');
  }

  get isRepresentedInMembership() {
    return this.role?.get('isRepresentedIn');
  }

  /**
   * Memberships that reflect the administrative hierarchy are managed by
   * migrations, not by users: province - municipality and province - OCMW
   * (generic relation) and municipality - OCMW ("served by").
   * The same goes for the government relations that are auto-filled:
   * the special organizations sit on the `member` side, the memberships
   * are created automatically and are not editable or removable.
   */
  get isNotRemovableByUser() {
    const org = this.belongsTo('organization').value();
    const member = this.belongsTo('member').value();
    const role = this.belongsTo('role').value();

    return (
      !this.isNew &&
      ((role?.hasRelationWith &&
        ((org?.isProvince && member?.isMunicipality) ||
          (org?.isProvince && member?.isOCMW) ||
          (org?.isMunicipality && member?.isOCMW))) ||
        (role?.serves && org?.isMunicipality && member?.isOCMW) ||
        ((role?.isFounderOf || role?.grantsRecognition) &&
          SPECIAL_RELATED_ORGANIZATION_IDS.includes(member?.id)))
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
