import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export const RELATION_TYPES = {
  HAS_RELATION_WITH: 'Heeft een relatie met',
  PARTICIPATES_IN: 'Participeert in',
  HAS_PARTICIPANTS: 'Heeft als participanten',
};

export const RELATION_TYPES_MAPPING = {
  '73d5e1cf250d42fab15926771f07505a': {
    label: 'Is oprichter van', // is founder of
    inverseLabel: 'Werd opgericht door', // was founded by
  },
  '2152eb830b1143bfb97a7dd9596d6c63': {
    label: 'Participeert in', // participates in
    inverseLabel: 'Heeft als participanten', // has as participants
  },
};

export default class OrganizationModel extends Model {
  @attr name;
  @attr alternativeName;
  @attr('date') expectedEndDate;
  @attr purpose;

  @belongsTo('site', {
    inverse: null,
  })
  primarySite;

  @belongsTo('organization-status-code', {
    inverse: null,
  })
  organizationStatus;

  @hasMany('identifier', {
    inverse: null,
  })
  identifiers;

  @hasMany('site', {
    inverse: null,
  })
  sites;

  @hasMany('change-event', {
    inverse: 'originalOrganizations',
  })
  changedBy;

  @hasMany('change-event', {
    inverse: 'resultingOrganizations',
  })
  resultedFrom;

  @hasMany('change-event-result', {
    inverse: 'resultingOrganization',
  })
  changeEventResults;

  @hasMany('post', {
    inverse: null,
  })
  positions;

  @hasMany('organization', {
    inverse: 'isAssociatedWith',
  })
  associatedOrganizations;

  @belongsTo('organization', {
    inverse: 'associatedOrganizations',
  })
  isAssociatedWith;

  @hasMany('membership', {
    inverse: 'member',
  })
  membershipsOfOrganization;

  @hasMany('membership', {
    inverse: 'organization',
  })
  memberships;

  @hasMany('organization', {
    inverse: null,
  })
  isMemberOf;
}
