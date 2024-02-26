import { attr, hasMany, belongsTo } from '@ember-data/model';
import AgentModel from './agent';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
  validateHasManyOptional,
  validateStringOptional,
} from '../validators/schema';

export default class OrganizationModel extends AgentModel {
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
    polymorphic: true,
    as: 'organization',
  })
  changedBy;

  @hasMany('change-event', {
    inverse: 'resultingOrganizations',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  resultedFrom;

  @hasMany('change-event-result', {
    inverse: 'resultingOrganization',
    async: true,
    polymorphic: true,
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
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  subOrganizations;

  @belongsTo('organization', {
    inverse: 'subOrganizations',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  isSubOrganizationOf;

  @hasMany('organization', {
    inverse: 'isAssociatedWith',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  associatedOrganizations;

  @belongsTo('organization', {
    inverse: 'associatedOrganizations',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  isAssociatedWith;

  @hasMany('organization', {
    inverse: 'wasFoundedByOrganizations',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  foundedOrganizations;

  @hasMany('organization', {
    inverse: 'foundedOrganizations',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  wasFoundedByOrganizations;

  @hasMany('organization', {
    inverse: 'hasParticipants',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  participatesIn;

  @hasMany('organization', {
    inverse: 'participatesIn',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  hasParticipants;

  get validationSchema() {
    return super.validationSchema.append({
      name: Joi.string().empty('').required().messages({
        'any.required': 'Vul de naam in',
      }),
      alternativeName: validateStringOptional(),
      expectedEndDate: Joi.date().allow(null),
      purpose: validateStringOptional(),
      primarySite: validateBelongsToOptional(),
      organizationStatus: validateBelongsToRequired('Selecteer een optie'),
      identifiers: validateHasManyOptional(),
      sites: validateHasManyOptional(),
      changedBy: validateHasManyOptional(),
      resultedFrom: validateHasManyOptional(),
      changeEventResults: validateHasManyOptional(),
      positions: validateHasManyOptional(),
      subOrganizations: validateHasManyOptional(),
      isSubOrganizationOf: validateBelongsToOptional(),
      associatedOrganizations: validateHasManyOptional(),
      isAssociatedWith: validateBelongsToOptional(),
      foundedOrganizations: validateHasManyOptional(),
      wasFoundedByOrganizations: validateHasManyOptional(),
      participatesIn: validateHasManyOptional(),
      hasParticipants: validateHasManyOptional(),
    });
  }
}
