import { belongsTo, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import {
  validateHasManyOptional,
  validateRequiredWhenClassificationId,
} from '../validators/schema';
import {
  CentralWorshipServiceCodeList,
  WorshipServiceCodeList,
} from '../constants/Classification';
import { CLASSIFICATION } from './administrative-unit-classification-code';

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
      recognizedWorshipType: validateRequiredWhenClassificationId(
        [...WorshipServiceCodeList, ...CentralWorshipServiceCodeList],
        'Selecteer een optie'
      ),
      ministerPositions: validateHasManyOptional(),
      involvements: validateHasManyOptional(),
    });
  }

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get localInvolvementClassifications() {
    return [CLASSIFICATION.MUNICIPALITY.id, CLASSIFICATION.PROVINCE.id];
  }
}
