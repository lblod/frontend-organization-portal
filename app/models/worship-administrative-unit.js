import { belongsTo, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import {
  validateBelongsToRequired,
  validateHasManyOptional,
} from '../validators/schema';
import { WITH_CENTRAL_WORSHIP_SERVICE } from './recognized-worship-type';
import {
  CentralWorshipServiceCodeList,
  WorshipServiceCodeList,
} from '../constants/Classification';

export default class WorshipAdministrativeUnitModel extends AdministrativeUnitModel {
  @belongsTo('recognized-worship-type', {
    inverse: null,
    async: true,
  })
  recognizedWorshipType;

  @hasMany('minister-position', {
    inverse: 'worshipService',
    async: true,
    polymorphic: true,
    as: 'worship-administrative-unit',
  })
  ministerPositions;

  @hasMany('local-involvement', {
    inverse: 'worshipAdministrativeUnit',
    async: true,
    polymorphic: true,
    as: 'worship-administrative-unit',
  })
  involvements;

  get validationSchema() {
    return super.validationSchema.append({
      recognizedWorshipType: validateBelongsToRequired('Selecteer een optie'),
      ministerPositions: validateHasManyOptional(),
      involvements: validateHasManyOptional(),
    });
  }

  get hasCentralWorshipService() {
    return (
      this.isWorshipService &&
      this.#hasRecognizedWorshipTypeId(WITH_CENTRAL_WORSHIP_SERVICE)
    );
  }

  #hasRecognizedWorshipTypeId(recognizedWorshipTypeIds) {
    return recognizedWorshipTypeIds.includes(
      this.recognizedWorshipType?.get('id')
    );
  }

  // NOTE: the following functions have to be placed here instead of in the more
  // specific models. The new organization form works based on an worship
  // administrative unit record and does not show the correct fields if these
  // functions are placed in the more specific models.
  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return this._hasClassificationId(WorshipServiceCodeList);
  }

  get isCentralWorshipService() {
    return this._hasClassificationId(CentralWorshipServiceCodeList);
  }
}
