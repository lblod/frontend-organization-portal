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
  })
  type;

  @belongsTo('decision', {
    inverse: null,
  })
  decision;

  @hasMany('organization', {
    inverse: 'resultedFrom',
  })
  resultingOrganizations;

  @hasMany('organization', {
    inverse: 'changedBy',
  })
  originalOrganizations;

  @hasMany('change-event-result', {
    inverse: 'resultFrom',
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
        is: Joi.exist().valid(
          CHANGE_EVENT_TYPE.FUSIE,
          CHANGE_EVENT_TYPE.MERGER
        ),
        then: validateHasManyRequired('Selecteer een resulterende organisatie'),
        otherwise: validateHasManyOptional(),
      }),
      originalOrganizations: Joi.when('type.id', {
        is: Joi.exist().valid(
          CHANGE_EVENT_TYPE.FUSIE,
          CHANGE_EVENT_TYPE.MERGER
        ),
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
    if (organization && !this.hasAsResultingOrganization(organization)) {
      /*
       * Note: Currently, the new change event form only supports specifying one
       * resulting organization. Therefore, we first clear any already contained
       * resulting organizations before adding the new one. If support for
       * multiple resulting organizations is added at some point, this clear
       * operation should be removed.
       */
      this.resultingOrganizations.clear();
      this.resultingOrganizations.pushObject(organization);
    }
  }

  removeResultingOrganization(organization) {
    this.resultingOrganizations.removeObject(organization);
  }
}
