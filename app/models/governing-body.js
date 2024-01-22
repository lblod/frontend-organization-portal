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
        .external(async (value, helpers) => {
          if (this.endDate && value > this.endDate) {
            return helpers.message(
              'Kies een startdatum die vóór de einddatum plaatsvindt'
            );
          }
          return value;
        })
        .messages({ 'any.required': 'Vul de startdatum in' }),
      endDate: Joi.date()
        .empty(null)
        .required()
        .external(async (value, helpers) => {
          if (this.startDate && value < this.startDate) {
            return helpers.message(
              'Kies een einddatum die na de startdatum plaatsvindt'
            );
          }
          return value;
        })
        .messages({
          'any.required': 'Vul de einddatum in',
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
