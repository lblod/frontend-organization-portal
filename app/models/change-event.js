import { attr, belongsTo, hasMany } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
  validateHasManyOptional,
  validateHasManyRequired,
} from '../validators/schema';
import { CHANGE_EVENT_TYPE } from './change-event-type';

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
    return (
      this.type?.get('id') &&
      this.type.get('id') !== CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED
    );
  }

  get isCityChangeEvent() {
    return (
      this.type?.get('id') && this.type.get('id') === CHANGE_EVENT_TYPE.CITY
    );
  }

  get isMergerChangeEvent() {
    return (
      this.type?.get('id') &&
      (this.type.get('id') === CHANGE_EVENT_TYPE.MERGER ||
        this.type.get('id') === CHANGE_EVENT_TYPE.FUSIE)
    );
  }

  // TODO: used also in new event form, name is not ideal
  get shouldShowExtraInformationCard() {
    let changeEventTypeId = this.type?.get('id');
    return (
      changeEventTypeId === CHANGE_EVENT_TYPE.MERGER ||
      changeEventTypeId === CHANGE_EVENT_TYPE.FUSIE ||
      changeEventTypeId === CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE
    );
  }
}
