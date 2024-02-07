import { belongsTo, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import {
  validateHasManyOptional,
  validateRequiredWhenClassificationId,
} from '../validators/schema';
import { WorshipServiceCodeList } from '../constants/Classification';

export default class WorshipAdministrativeUnitModel extends AdministrativeUnitModel {
  @belongsTo('recognized-worship-type', {
    inverse: null,
    async: true,
  })
  recognizedWorshipType;

  @hasMany('minister-position', {
    inverse: 'worshipService',
    async: true,
  })
  ministerPositions;

  @hasMany('local-involvement', {
    inverse: 'worshipAdministrativeUnit',
    async: true,
  })
  involvements;

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
}
