import { attr, belongsTo, hasMany } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
  validateHasManyOptional,
  validateHasManyRequired,
} from '../validators/schema';
import {
  CHANGE_EVENT_TYPE,
  MergerTypeIdList,
  MultipleOrganizationTypeIdList,
  RequiresDecisionTypeIdList,
} from './change-event-type';

export default class ChangeEventModel extends AbstractValidationModel {
  @attr('date') date;
  @attr description;

  @belongsTo('change-event-type', {
    inverse: null,
    async: true,
  })
  type;

  @belongsTo('decision', {
    inverse: null,
    async: true,
  })
  decision;

  @hasMany('organization', {
    inverse: 'resultedFrom',
    async: true,
    polymorphic: true,
    as: 'change-event',
  })
  resultingOrganizations;

  @hasMany('organization', {
    inverse: 'changedBy',
    async: true,
    polymorphic: true,
    as: 'change-event',
  })
  originalOrganizations;

  @hasMany('change-event-result', {
    inverse: 'resultFrom',
    async: true,
  })
  results;

  get validationSchema() {
    return Joi.object({
      date: Joi.date()
        .empty(null)
        .required()
        .messages({ 'any.required': 'Vul de datum in' }),
      description: Joi.string().empty(''),
      type: validateBelongsToRequired('Selecteer een type'),
      decision: validateBelongsToOptional(),
      resultingOrganizations: Joi.when('type.id', {
        is: Joi.exist().valid(...MergerTypeIdList),
        then: validateHasManyRequired('Selecteer een resulterende organisatie'),
        otherwise: validateHasManyOptional(),
      }),
      originalOrganizations: Joi.when('type.id', {
        is: Joi.exist().valid(...MergerTypeIdList),
        then: Joi.array()
          .required()
          .min(2)
          .messages({ '*': 'Selecteer een betrokken organisatie' }),
        otherwise: validateHasManyOptional(),
      }),
      results: validateHasManyOptional(),
    });
  }

  get requiresDecisionInformation() {
    return this.#hasTypeId(RequiresDecisionTypeIdList);
  }

  get isCityChangeEvent() {
    return this.#hasTypeId([CHANGE_EVENT_TYPE.CITY]);
  }

  get isMergerChangeEvent() {
    return this.#hasTypeId(MergerTypeIdList);
  }

  get canAffectMultipleOrganizations() {
    return this.#hasTypeId(MultipleOrganizationTypeIdList);
  }

  #hasTypeId(typeIds) {
    return typeIds.includes(this.type?.get('id'));
  }

  hasAsOriginalOrganization(organization) {
    return this.originalOrganizations.includes(organization);
  }

  addOriginalOrganization(organization) {
    if (organization && !this.hasAsOriginalOrganization(organization)) {
      this.originalOrganizations.pushObject(organization);
    }
  }

  removeOriginalOrganization(organization) {
    this.originalOrganizations.removeObject(organization);
  }

  hasAsResultingOrganization(organization) {
    return this.resultingOrganizations.includes(organization);
  }

  addResultingOrganization(organization) {
    console.log('organization', organization);
    console.log(
      'this.hasAsResultingOrganization',
      this.hasAsResultingOrganization(organization)
    );
    if (organization && !this.hasAsResultingOrganization(organization)) {
      /*
       * Note: Currently, the new change event form only supports specifying one
       * resulting organization. Therefore, we first clear any already contained
       * resulting organizations before adding the new one. If support for
       * multiple resulting organizations is added at some point, this clear
       * operation should be removed.
       */
      console.log('clearing resulting organizations');
      this.resultingOrganizations.clear();
      console.log('adding resulting organization');
      this.resultingOrganizations.pushObject(organization);
      console.log('resulting organizations', this.resultingOrganizations);
    }
  }

  removeResultingOrganization(organization) {
    this.resultingOrganizations.removeObject(organization);
  }
}
