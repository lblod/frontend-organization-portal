import { attr } from '@warp-drive/legacy/model';
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
    const defaultSchema = super.validationSchema.append({
      denomination: validateStringOptional(),
      crossBorder: Joi.boolean(),
    });

    // This is used by the local involvements edit page to only validate the data that can be edited there.
    // Otherwise the user might get false-negative validation errors.
    const involvementsSchema = Joi.object({
      involvements: Joi.array().external(async (_value, helpers) => {
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
    });

    return Joi.when(Joi.ref('$involvementsPercentage'), {
      is: true,
      then: involvementsSchema,
      otherwise: defaultSchema,
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
