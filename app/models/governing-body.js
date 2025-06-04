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
    async: true,
    polymorphic: true,
    as: 'governingBody',
  })
  administrativeUnit;

  @belongsTo('governing-body-classification-code', {
    inverse: null,
    async: true,
  })
  classification;

  @belongsTo('governing-body', {
    inverse: 'hasTimeSpecializations',
    async: true,
  })
  isTimeSpecializationOf;

  @hasMany('governing-body', {
    inverse: 'isTimeSpecializationOf',
    async: true,
  })
  hasTimeSpecializations;

  @hasMany('mandate', {
    inverse: 'governingBody',
    async: true,
  })
  mandates;

  @hasMany('board-position', {
    inverse: 'governingBodies',
    async: true,
  })
  boardPositions;

  get period() {
    return (
      (this.startDate?.getFullYear() ?? '') +
      ' - ' +
      (this.endDate?.getFullYear() ?? '')
    ).trim();
  }

  get validationSchema() {
    return Joi.object({
      startDate: Joi.date()
        .empty(null)
        .required()
        .external(async (value, helpers) => {
          // Note, Joi does not handle cyclic references properly. Therefore, we
          // check whether the start date precedes the end date (if any) in this
          // external check instead of using Joi.date().max().
          if (this.endDate && value > this.endDate) {
            return helpers.message(
              'Kies een startdatum die vóór de einddatum plaatsvindt',
            );
          }

          return value;
        })
        .messages({
          'any.required': 'Vul de startdatum in',
          'date.base': 'Vul de startdatum in',
        }),
      endDate: Joi.date()
        .empty(null)
        .required()
        .external(async (value, helpers) => {
          // Note, Joi does not handle cyclic references properly. Therefore, we
          // check whether the end is after the start date (if any) in this
          // external check instead of using Joi.date().min().
          if (this.startDate && value < this.startDate) {
            return helpers.message(
              'Kies een einddatum die na de startdatum plaatsvindt',
            );
          }

          return value;
        })
        .messages({
          'any.required': 'Vul de einddatum in',
          'date.base': 'Vul de einddatum in',
        }),
      administrativeUnit: validateBelongsToOptional(),
      classification: validateBelongsToOptional(),
      isTimeSpecializationOf: validateBelongsToOptional(),
      hasTimeSpecializations: validateHasManyOptional(),
      mandates: validateHasManyOptional(),
      boardPositions: validateHasManyOptional(),
    });
  }
}
