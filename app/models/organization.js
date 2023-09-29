import Model, { attr, hasMany, belongsTo } from '@ember-data/model';

export default class OrganizationModel extends Model {
  @attr name;
  @attr alternativeName;
  @attr('date') expectedEndDate;
  @attr purpose;

  @belongsTo('site', {
    inverse: null,
    async: true,
  })
  primarySite;

  @belongsTo('organization-status-code', {
    inverse: null,
    async: true,
  })
  organizationStatus;

  @hasMany('identifier', {
    inverse: null,
    async: true,
  })
  identifiers;

  @hasMany('site', {
    inverse: null,
    async: true,
  })
  sites;

  @hasMany('change-event', {
    inverse: 'originalOrganizations',
    async: true,
  })
  changedBy;

  @hasMany('change-event', {
    inverse: 'resultingOrganizations',
    async: true,
  })
  resultedFrom;

  @hasMany('change-event-result', {
    inverse: 'resultingOrganization',
    async: true,
  })
  changeEventResults;

  @hasMany('post', {
    inverse: null,
    async: true,
  })
  positions;

  @hasMany('organization', {
    inverse: 'isSubOrganizationOf',
    async: true,
  })
  subOrganizations;

  @belongsTo('organization', {
    inverse: 'subOrganizations',
    async: true,
  })
  isSubOrganizationOf;

  @hasMany('organization', {
    inverse: 'isAssociatedWith',
    async: true,
  })
  associatedOrganizations;

  @belongsTo('organization', {
    inverse: 'associatedOrganizations',
    async: true,
  })
  isAssociatedWith;

  @hasMany('organization', {
    inverse: 'wasFoundedByOrganization',
    async: true,
  })
  foundedOrganizations;

  @belongsTo('organization', {
    inverse: 'foundedOrganizations',
    async: true,
  })
  wasFoundedByOrganization;

  @hasMany('organization', {
    inverse: 'hasParticipants',
    async: true,
  })
  participatesIn;

  @hasMany('organization', {
    inverse: 'participatesIn',
    async: true,
  })
  hasParticipants;
}
