import { belongsTo, hasMany } from '@ember-data/model';
import OrganizationModel from './organization';
import {
  validateBelongsToOptional,
  validateHasManyOptional,
} from '../validators/schema';
import { RepresentativeBodyCodeList } from '../constants/Classification';

export const BLACKLIST_RO = [
  'e224c637ba8bb0e5dfbb87da225b4652', // Executief van de Moslims van België
];

export default class RepresentativeBodyModel extends OrganizationModel {
  @belongsTo('recognized-worship-type', {
    inverse: null,
    async: true,
  })
  recognizedWorshipType;

  @hasMany('minister-positions', {
    inverse: 'representativeBody',
    async: true,
  })
  ministerPositions;

  get validationSchema() {
    return super.validationSchema.append({
      recognizedWorshipType: validateBelongsToOptional(),
      ministerPositions: validateHasManyOptional(),
    });
  }

  get isRepresentativeBody() {
    return this._hasClassificationId(RepresentativeBodyCodeList);
  }
}
