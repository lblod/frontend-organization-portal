import { attr } from '@ember-data/model';
import WorshipAdministrativeUnitModel from './worship-administrative-unit';
import Joi from 'joi';

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
      denomination: Joi.string().empty(''),
      crossBorder: Joi.boolean(),
    });
  }
}
