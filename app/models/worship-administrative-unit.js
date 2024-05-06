import { belongsTo, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import {
  validateBelongsToRequired,
  validateHasManyOptional,
} from '../validators/schema';
import { WITH_CENTRAL_WORSHIP_SERVICE } from './recognized-worship-type';

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
}
