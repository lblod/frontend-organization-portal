import { attr } from '@ember-data/model';
import Joi from 'joi';
import WorshipAdministrativeUnitModel from './worship-administrative-unit';
import { validateStringOptional } from '../validators/schema';
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

  #hasRecognizedWorshipTypeId(classificationIds) {
    return classificationIds.includes(this.classification?.get('id'));
  }
}
