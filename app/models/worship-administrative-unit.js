import { belongsTo, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import {
  validateHasManyOptional,
  validateRequiredWhenClassificationId,
} from '../validators/schema';
import { WorshipServiceCodeList } from '../constants/Classification';
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

  @belongsTo('kbo-administrative-unit', {
    inverse: 'worshipAdministrativeUnit',
    polymorphic: true,
    async: true,
  })
  kboAdministrativeUnit;

  get validationSchema() {
    return super.validationSchema.append({
      recognizedWorshipType: validateRequiredWhenClassificationId(
        WorshipServiceCodeList,
        'Selecteer een optie'
      ),
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

  #hasRecognizedWorshipTypeId(classificationIds) {
    return classificationIds.includes(this.classification?.get('id'));
  }
}
