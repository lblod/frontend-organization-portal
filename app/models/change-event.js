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

  async hasAsOriginalOrganization(organization) {
    return (await this.originalOrganizations).includes(organization);
  }

  async addOriginalOrganization(organization) {
    if (organization && !(await this.hasAsOriginalOrganization(organization))) {
      (await this.originalOrganizations).push(organization);
    }
  }

  async removeOriginalOrganization(organization) {
    const originalOrganizations = await this.originalOrganizations;
    const index = originalOrganizations.indexOf(organization);
    if (index > -1) {
      originalOrganizations.splice(index, 1);
    }
  }

  async hasAsResultingOrganization(organization) {
    return (await this.resultingOrganizations).includes(organization);
  }

  async addResultingOrganization(organization) {
    if (
      organization &&
      !(await this.hasAsResultingOrganization(organization))
    ) {
      /*
       * Note: Currently, the new change event form only supports specifying one
       * resulting organization. Therefore, we first clear any already contained
       * resulting organizations before adding the new one. If support for
       * multiple resulting organizations is added at some point, this clear
       * operation should be removed.
       */
      (await this.resultingOrganizations).length = 0;
      (await this.resultingOrganizations).push(organization);
    }
  }

  async removeResultingOrganization(organization) {
    const resultingOrganizations = await this.resultingOrganizations;
    const index = resultingOrganizations.indexOf(organization);
    if (index > -1) {
      resultingOrganizations.splice(index, 1);
    }
  }
}
