import { belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
} from '../validators/schema';

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
      role: validateBelongsToRequired(REQUIRED_MESSAGE),
      during: validateBelongsToOptional(),
    });
  }

  /**
   * Get the label of the role as it should be read from the perspective of
   * either the member or organization. For example, a participation membership
   * from the member perspective should result in 'Participeert in', while from
   * the organization perspective it is 'Heeft als participanten'.
   * @param {*} member - A truthy value means taking the member perspective.
   * @returns {string} The role label as read from the specified perspective.
   */
  getRoleLabel(member) {
    if (member) {
      return this.role.get('inverseOpLabel');
    }
    return this.role.get('opLabel');
  }

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
}
