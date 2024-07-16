import Model, { belongsTo } from '@ember-data/model';

// TODO: add validations?
export default class MembershipModel extends Model {
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
}
