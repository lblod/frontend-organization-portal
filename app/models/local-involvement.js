import { attr, belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
} from '../validators/schema';
import { INVOLVEMENT_TYPE } from './involvement-type';

export default class LocalInvolvementModel extends AbstractValidationModel {
  @attr('number') percentage;

  @belongsTo('administrative-unit', {
    inverse: 'involvedBoards',
    async: true,
    polymorphic: true,
    as: 'local-involvement',
  })
  administrativeUnit;

  @belongsTo('involvement-type', {
    inverse: null,
    async: true,
  })
  involvementType;

  @belongsTo('worship-administrative-unit', {
    inverse: 'involvements',
    async: true,
    polymorphic: true,
    as: 'local-involvement',
  })
  worshipAdministrativeUnit;

  get validationSchema() {
    return Joi.object({
      administrativeUnit: validateBelongsToRequired(
        'Selecteer een lokaal bestuur'
      ),
      involvementType: validateBelongsToRequired(
        'Selecteer een type betrokkenheid'
      ).external(async (value, helpers) => {
        const administrativeUnit = await this.administrativeUnit;
        if (
          administrativeUnit.isProvince &&
          value.id === INVOLVEMENT_TYPE.ADVISORY
        ) {
          return helpers.message(
            'Adviserend is geen geldige keuze voor een provincie'
          );
        }

        return value;
      }),
      percentage: Joi.when('involvementType.id', {
        is: Joi.exist().valid(INVOLVEMENT_TYPE.SUPERVISORY),
        then: Joi.number().min(1).max(100).required(),
        otherwise: Joi.number().empty('').allow(null),
      }).messages({
        'any.required': 'Vul het percentage in',
        'number.base': 'Vul het percentage in',
        'number.min': 'Het percentage moet groter zijn dan 0',
        'number.max': 'Het percentage mag niet groter zijn dan 100',
      }),

      worshipAdministrativeUnit: validateBelongsToOptional(),
    });
  }

  get isSupervisory() {
    return this.#hasInvolvementTypeId(INVOLVEMENT_TYPE.SUPERVISORY);
  }

  get isMidFinancial() {
    return this.#hasInvolvementTypeId(INVOLVEMENT_TYPE.MID_FINANCIAL);
  }

  get isAdvisory() {
    return this.#hasInvolvementTypeId(INVOLVEMENT_TYPE.ADVISORY);
  }

  #hasInvolvementTypeId(classificationId) {
    return this.involvementType?.get('id') === classificationId;
  }
}
