import { attr } from '@ember-data/model';
import Joi from 'joi';
import WorshipAdministrativeUnitModel from './worship-administrative-unit';
import { validateStringOptional } from '../validators/schema';

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
    });
  }
}
