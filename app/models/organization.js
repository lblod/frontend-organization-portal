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
    as: 'organization',
  })
  changedBy;

  @hasMany('change-event', {
    inverse: 'resultingOrganizations',
    async: true,
    as: 'organization',
  })
  resultedFrom;

  @hasMany('change-event-result', {
    inverse: 'resultingOrganization',
    async: true,
    as: 'organization',
  })
  changeEventResults;

  @hasMany('post', {
    inverse: null,
    async: true,
  })
  positions;

  @hasMany('organization', {
    inverse: 'isSubOrganizationOf',
    polymorphic: true,
    async: true,
    as: 'organization',
  })
  subOrganizations;

  @belongsTo('organization', {
    inverse: 'subOrganizations',
    polymorphic: true,
    async: true,
    as: 'organization',
  })
  isSubOrganizationOf;

  @hasMany('organization', {
    inverse: 'isAssociatedWith',
    polymorphic: true,
    async: true,
    as: 'organization',
  })
  associatedOrganizations;

  @belongsTo('organization', {
    inverse: 'associatedOrganizations',
    polymorphic: true,
    async: true,
    as: 'organization',
  })
  isAssociatedWith;

  @hasMany('organization', {
    inverse: 'wasFoundedByOrganization',
    polymorphic: true,
    async: true,
    as: 'organization',
  })
  foundedOrganizations;

  @belongsTo('organization', {
    inverse: 'foundedOrganizations',
    polymorphic: true,
    async: true,
    as: 'organization',
  })
  wasFoundedByOrganization;

  @hasMany('organization', {
    inverse: 'hasParticipants',
  })
  participatesIn;

  @hasMany('organization', {
    inverse: 'participatesIn',
  })
  hasParticipants;
}
