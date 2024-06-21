import Model, { belongsTo } from '@ember-data/model';

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
}
