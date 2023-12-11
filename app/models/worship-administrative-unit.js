import { belongsTo, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import {
  hasManyOptional,
  requiredWhenClassificationId,
} from '../validators/schema';
import { WorshipServiceCodeList } from '../constants/Classification';

export default class WorshipAdministrativeUnitModel extends AdministrativeUnitModel {
  @belongsTo('recognized-worship-type', {
    inverse: null,
  })
  recognizedWorshipType;

  @hasMany('minister-position', {
    inverse: 'worshipService',
  })
  ministerPositions;

  @hasMany('local-involvement', {
    inverse: 'worshipAdministrativeUnit',
  })
  involvements;

  get validationSchema() {
    return super.validationSchema.append({
      'recognized-worship-type': requiredWhenClassificationId(
        WorshipServiceCodeList
      ),
      'minister-positions': hasManyOptional(),
      involvements: hasManyOptional(),
    });
  }
}
