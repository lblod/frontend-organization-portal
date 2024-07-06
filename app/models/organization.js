import { attr, hasMany, belongsTo } from '@ember-data/model';
import { action } from '@ember/object';
import AgentModel from './agent';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
  validateHasManyOptional,
  validateStringOptional,
} from '../validators/schema';
import getOppositeClassifications from '../constants/memberships';

export default class OrganizationModel extends AgentModel {
  @attr name;
  @attr legalName;
  @attr('string-set') alternativeName; // Note: changing to plural breaks stuff
  @attr('date') expectedEndDate;
  @attr purpose;

  @belongsTo('organization-classification-code', {
    inverse: null,
    async: true,
    polymorphic: true,
  })
  classification;

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

  @hasMany('membership', {
    inverse: 'member',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  membershipsOfOrganizations;

  @hasMany('membership', {
    inverse: 'organization',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  memberships;

  @belongsTo('kbo-organization', {
    inverse: 'organization',
    async: true,
    as: 'organization',
  })
  kboOrganization;

  get validationSchema() {
    const REQUIRED_MESSAGE = 'Selecteer een optie';
    return super.validationSchema.append({
      name: validateStringOptional(),
      legalName: Joi.string().empty('').required().messages({
        'any.required': 'Vul de juridische naam in',
      }),
      alternativeName: Joi.array().optional(),
      expectedEndDate: Joi.date().allow(null),
      purpose: validateStringOptional(),
      classification: validateBelongsToRequired(REQUIRED_MESSAGE),
      primarySite: validateBelongsToOptional(),
      organizationStatus: validateBelongsToRequired(REQUIRED_MESSAGE),
      identifiers: validateHasManyOptional(),
      sites: validateHasManyOptional(),
      changedBy: validateHasManyOptional(),
      resultedFrom: validateHasManyOptional(),
      changeEventResults: validateHasManyOptional(),
      positions: validateHasManyOptional(),
      membershipsOfOrganizations: validateHasManyOptional(),
      memberships: validateHasManyOptional(),
      kboOrganization: validateBelongsToOptional(),
    });
  }

  get abbName() {
    return this.legalName ?? this.kboOrganization?.get('name') ?? this.name;
  }

  setAbbName(name) {
    this.name = name;
    this.legalName = name;
  }

  setAlternativeName(names) {
    this.alternativeName = names
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '');
  }

  _hasClassificationId(classificationIds) {
    return classificationIds.includes(this.classification?.get('id'));
  }

  /**
   * Get the list of organization's classification codes which can have the
   * given membership relation with this organization. The direction of the
   * membership relation is determined based on whether this organization acts
   * as member or organization in the provided membership.
   * @param {{@link MembershipModel}} membership - The membership for which to
   *     determine the appropriate classification codes.
   * @returns {[string]} A list of classifications codes specifying the kinds of
   *     organizations that are allowed to act as the other organization in the
   *     membership with this organization. If this organization is not involved
   *     in the provided membership, the result is an empty list.
   */
  @action
  getClassificationCodesForMembership(membership) {
    return getOppositeClassifications(membership, this);
  }
}
