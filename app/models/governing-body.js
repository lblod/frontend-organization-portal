import { attr, hasMany, belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateHasManyOptional,
} from '../validators/schema';
import { EXECUTIVE_ORGANEN } from './governing-body-classification-code';

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
            let governingBodies = await this.getOtherTimedGoverningBodies();

            for (const body of governingBodies) {
              if (inPeriod(body.startDate, this.startDate, this.endDate)) {
                return helpers.message('Geen overlap');
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
            let governingBodies = await this.getOtherTimedGoverningBodies();

            for (const body of governingBodies) {
              if (inPeriod(body.endDate, this.startDate, this.endDate)) {
                return helpers.message('Geen overlap');
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

  async #getAdministrativeUnitId() {
    let untimedBody = await this.isTimeSpecializationOf;
    if (untimedBody) {
      let administrativeUnit = await untimedBody.administrativeUnit;
      return administrativeUnit.get('id');
    }
  }

  async #getUntimedGoverningBodies() {
    let administrativeUnitId = await this.#getAdministrativeUnitId();
    let untimedGoverningBodies = await this.store.query('governing-body', {
      filter: {
        'administrative-unit': {
          id: administrativeUnitId,
        },
      },
      include: 'has-time-specializations,classification',
    });
    return untimedGoverningBodies;
  }

  async getOtherTimedGoverningBodies() {
    let untimedGoverningBodies = (
      await this.#getUntimedGoverningBodies()
    ).toArray();

    let governingBodies = [];
    for (const untimedGoverningBody of untimedGoverningBodies) {
      let classification = await untimedGoverningBody.classification;
      if (!EXECUTIVE_ORGANEN.includes(classification.id)) {
        const timedGoverningBodies = untimedGoverningBody
          ? await untimedGoverningBody.hasTimeSpecializations
          : [];

        const arrayTimedGoverningBodies = timedGoverningBodies.toArray();

        governingBodies.push(...arrayTimedGoverningBodies);
      }
    }

    // TODO filter based on ids
    return governingBodies.filter((body) => body !== this);
  }
}

/**
 * Checks whether a given date is strictly between a start and end date. If
 * either of the arguments are missing it defaults to false.
 */
export function inPeriod(date, start, end) {
  if (date && start && end) {
    let time = date.getTime();
    return start.getTime() < time && time < end.getTime();
  }
  return false;
}
