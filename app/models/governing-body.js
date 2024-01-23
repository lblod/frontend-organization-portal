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

          if (this.changedAttributes().startDate) {
            // TODO: following check is probably unnecessary if data in
            // triplestore is correct, it does make tests slightly easier
            if (this.administrativeUnit && this.administrativeUnit.get('id')) {
              let records = await this.store.query('governing-body', {
                filter: {
                  'administrative-unit': {
                    ':exact:id': this.administrativeUnit.get('id'),
                  },
                },
              });

              for (const body of records.without(this)) {
                if (inPeriod(this.startDate, body.startDate, body.endDate)) {
                  return helpers.message('Geen overlap');
                }
              }
            }
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

          if (this.changedAttributes().endDate) {
            // TODO: following check is probably unnecessary if data in
            // triplestore is correct, it does make tests slightly easier
            if (this.administrativeUnit && this.administrativeUnit.get('id')) {
              let records = await this.store.query('governing-body', {
                filter: {
                  'administrative-unit': {
                    ':exact:id': this.administrativeUnit.get('id'),
                  },
                },
              });

              for (const body of records.without(this)) {
                if (inPeriod(this.endDate, body.startDate, body.endDate)) {
                  return helpers.message('Geen overlap');
                }
              }
            }
          }

          return value;
        })
        .messages({
          'any.required': 'Vul de einddatum in',
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

export function inPeriod(date, start, end) {
  if (date && start && end) {
    let time = date.getTime();
    return start.getTime() <= time && time <= end.getTime();
  }
  return false;
}
