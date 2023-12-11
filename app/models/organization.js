import { attr, hasMany, belongsTo } from '@ember-data/model';
import AgentModel from './agent';
import Joi from 'joi';
import { belongToOptional, hasManyOptional } from '../validators/schema';

export default class OrganizationModel extends AgentModel {
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
    inverse: 'isSubOrganizationOf',
  })
  subOrganizations;

  @belongsTo('organization', {
    inverse: 'subOrganizations',
  })
  isSubOrganizationOf;

  @hasMany('organization', {
    inverse: 'isAssociatedWith',
  })
  associatedOrganizations;

  @belongsTo('organization', {
    inverse: 'associatedOrganizations',
  })
  isAssociatedWith;

  @hasMany('organization', {
    inverse: 'wasFoundedByOrganization',
  })
  foundedOrganizations;

  @belongsTo('organization', {
    inverse: 'foundedOrganizations',
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

  get validationSchema() {
    return super.validationSchema.append({
      name: Joi.string()
        .required()
        .messages({ 'any.required': 'Vul de naam in' }),
      'alternative-name': Joi.string(),
      'expected-end-date': Joi.date().allow(null),
      purpose: Joi.string(),
      'primary-site': belongToOptional(),
      'organization-status': belongToOptional(),
      identifiers: hasManyOptional(),
      sites: hasManyOptional(),
      'changed-by': hasManyOptional(),
      'resulted-from': hasManyOptional(),
      'change-event-results': hasManyOptional(),
      positions: hasManyOptional(),
      'sub-organizations': hasManyOptional(),
      'is-sub-organization-of': belongToOptional(),
      'associated-organizations': hasManyOptional(),
      'is-associated-with': belongToOptional(),
      'founded-organizations': hasManyOptional(),
      'was-founded-by-organization': belongToOptional(),
      'participates-in': hasManyOptional(),
      'has-participants': hasManyOptional(),
    });
  }
}
