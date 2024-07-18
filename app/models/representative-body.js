import { belongsTo, hasMany } from '@ember-data/model';
import Joi from 'joi';
import OrganizationModel from './organization';
import {
  validateBelongsToOptional,
  validateHasManyNotEmptyRequired,
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
      // NOTE: The requested functionality was to *not* validate memberships of
      // already existing organizations. When creating a new organization a
      // mandatory membership is enforced by providing a `true` value for
      // `creatingNewOrganization`.
      membershipsOfOrganizations: Joi.when(
        Joi.ref('$creatingNewOrganization'),
        {
          is: Joi.exist().valid(true),
          then: validateHasManyNotEmptyRequired('Selecteer een optie'),
          otherwise: validateHasManyOptional(),
        },
      ),
    });
  }

  get isRepresentativeBody() {
    return this._hasClassificationId(RepresentativeBodyCodeList);
  }
}
