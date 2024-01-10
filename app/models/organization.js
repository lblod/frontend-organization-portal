import { attr, hasMany, belongsTo } from '@ember-data/model';
import AgentModel from './agent';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
  validateHasManyOptional,
} from '../validators/schema';

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
    inverse: 'wasFoundedByOrganizations',
  })
  foundedOrganizations;

  @hasMany('organization', {
    inverse: 'foundedOrganizations',
  })
  wasFoundedByOrganizations;

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
      name: Joi.string().empty('').required().messages({
        'any.required': 'Vul de naam in',
      }),
      alternativeName: Joi.string().empty(''),
      expectedEndDate: Joi.date().allow(null),
      purpose: Joi.string().empty(''),
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
