import { attr } from '@ember-data/model';
import Joi from 'joi';
import WorshipAdministrativeUnitModel from './worship-administrative-unit';
import {
  validateHasManyOptional,
  validateStringOptional,
} from '../validators/schema';
import { WorshipServiceCodeList } from '../constants/Classification';
import { WITH_CENTRAL_WORSHIP_SERVICE } from './recognized-worship-type';

export default class WorshipServiceModel extends WorshipAdministrativeUnitModel {
  @attr denomination;
  @attr crossBorder;

  get crossBorderNominal() {
    if (this.crossBorder) {
      return 'Ja';
    } else {
      return 'Nee';
    }
  }

  get validationSchema() {
    return super.validationSchema.append({
      denomination: validateStringOptional(),
      crossBorder: Joi.boolean(),
      involvements: Joi.when(Joi.ref('$involvementsPercentage'), {
        is: Joi.exist().valid(true),
        then: Joi.array().external(async (_value, helpers) => {
          console.log('hello');
          const involvements = await this.involvements;

          const sumPercentages = involvements.reduce(
            (percentageAcc, involvement) =>
              percentageAcc + Number(involvement.percentage),
            0,
          );

          if (Number.isNaN(sumPercentages) || sumPercentages !== 100) {
            return helpers.message(
              'Het totaal van alle percentages moet gelijk zijn aan 100',
            );
          }
        }),
        otherwise: validateHasManyOptional(),
      }),
    });
  }

  get isWorshipService() {
    return this._hasClassificationId(WorshipServiceCodeList);
  }

  get hasCentralWorshipService() {
    return (
      this.isWorshipService &&
      this.#hasRecognizedWorshipTypeId(WITH_CENTRAL_WORSHIP_SERVICE)
    );
  }

  #hasRecognizedWorshipTypeId(recognizedWorshipTypeIds) {
    return recognizedWorshipTypeIds.includes(
      this.recognizedWorshipType?.get('id'),
    );
  }
}
