import { belongsTo, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import Joi from 'joi';
import {
  validateHasManyNotEmptyRequired,
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
    const REQUIRED_MESSAGE = 'Selecteer een optie';
    return super.validationSchema.append({
      recognizedWorshipType: validateRequiredWhenClassificationId(
        [...WorshipServiceCodeList, ...CentralWorshipServiceCodeList],
        REQUIRED_MESSAGE
      ),
      ministerPositions: validateHasManyOptional(),
      involvements: validateHasManyOptional(),
      // NOTE:The requested functionality was to *not* validate memberships of
      // already existing organizations. When creating a new organization a
      // mandatory membership is enforced by providing a `true` value for
      // `creatingNewOrganization`.
      membershipsOfOrganizations: Joi.when(
        Joi.ref('$creatingNewOrganization'),
        {
          is: Joi.exist().valid(true),
          then: validateHasManyNotEmptyRequired(REQUIRED_MESSAGE),
          otherwise: validateHasManyOptional(),
        }
      ),
    });
  }

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get localInvolvementClassifications() {
    return [CLASSIFICATION.MUNICIPALITY.id, CLASSIFICATION.PROVINCE.id];
  }
}
