import { attr, hasMany, belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateHasManyOptional,
} from '../validators/schema';

export default class GoverningBodyModel extends AbstractValidationModel {
  @attr('date') startDate;
  @attr('date') endDate;

  @belongsTo('administrative-unit', {
    inverse: 'governingBodies',
  })
  administrativeUnit;

  @belongsTo('governing-body-classification-code', {
    inverse: null,
  })
  classification;

  @belongsTo('governing-body', {
    inverse: 'hasTimeSpecializations',
  })
  isTimeSpecializationOf;

  @hasMany('governing-body', {
    inverse: 'isTimeSpecializationOf',
  })
  hasTimeSpecializations;

  @hasMany('mandate', {
    inverse: 'governingBody',
  })
  mandates;

  @hasMany('board-position', {
    inverse: 'governingBodies',
  })
  boardPositions;

  get period() {
    let period = '-';
    if (this.startDate && this.endDate) {
      period =
        this.startDate.getFullYear() + ' - ' + this.endDate.getFullYear();
    } else if (this.startDate) {
      period = this.startDate.getFullYear() + ' -';
    } else if (this.endDate) {
      period = '- ' + this.endDate.getFullYear();
    }
    return period;
  }

  get validationSchema() {
    return Joi.object({
      startDate: Joi.date()
        .empty(null)
        .required()
        .when(Joi.ref('endDate'), {
          is: Joi.exist(),
          then: Joi.date().max(Joi.ref('endDate')),
        })
        .messages({
          'any.required': 'Vul de startdatum in',
          'date.max': 'Kies een startdatum die vóór de einddatum plaatsvindt',
        }),
      endDate: Joi.date()
        .empty(null)
        .required()
        // TODO: results in an undefined model, cannot have cyclic refs?
        // .when(Joi.ref('startDate'), {
        //   is: Joi.date(),
        //   then: Joi.date().min(Joi.ref('startDate')),
        // })
        .messages({
          'any.required': 'Vul de einddatum in',
          'date.min': 'Kies een einddatum die na de startdatum plaatsvindt',
        }),
      // TODO: validate there is no overlap with other governing bodies
      administrativeUnit: validateBelongsToOptional(),
      classification: validateBelongsToOptional(),
      isTimeSpecializationOf: validateBelongsToOptional(),
      hasTimeSpecializations: validateHasManyOptional(),
      mandates: validateHasManyOptional(),
      boardPositions: validateHasManyOptional(),
    });
  }
}
