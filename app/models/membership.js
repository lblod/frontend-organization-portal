import Model, { belongsTo } from '@ember-data/model';

export default class MembershipModel extends Model {
  @belongsTo('organization', {
    inverse: 'membershipsOfOrganization',
  })
  member;

  @belongsTo('organization', {
    inverse: 'memberships',
  })
  organization;

  @belongsTo('membership-role', {
    inverse: null,
  })
  role;

  @belongsTo('period-of-time', {
    inverse: null,
  })
  during;
}
