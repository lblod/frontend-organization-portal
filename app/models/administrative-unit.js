import { hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateHasManyOptional,
  validateRequiredWhenClassificationId,
} from '../validators/schema';
import {
  AgbCodeList,
  ApbCodeList,
  AssistanceZoneCodeList,
  CentralWorshipServiceCodeList,
  IGSCodeList,
  OcmwAssociationCodeList,
  PoliceZoneCodeList,
  WorshipServiceCodeList,
  PevaMunicipalityCodeList,
  PevaProvinceCodeList,
} from '../constants/Classification';

export default class AdministrativeUnitModel extends OrganizationModel {
  @belongsTo('location', {
    inverse: 'administrativeUnits',
    async: true,
    polymorphic: true,
    as: 'administrative-unit',
  })
  locatedWithin;

  @hasMany('governing-body', {
    inverse: 'administrativeUnit',
    async: true,
    polymorphic: true,
    as: 'administrative-unit',
  })
  governingBodies;

  @hasMany('local-involvement', {
    inverse: 'administrativeUnit',
    async: true,
    polymorphic: true,
    as: 'administrative-unit',
  })
  involvedBoards;

  @belongsTo('concept', {
    inverse: null,
    async: true,
  })
  exactMatch;

  @belongsTo('location', {
    inverse: null,
    async: true,
  })
  scope;

  get validationSchema() {
    const REQUIRED_MESSAGE = 'Selecteer een optie';
    return super.validationSchema.append({
      locatedWithin: validateBelongsToOptional(),
      governingBodies: validateHasManyOptional(),
      involvedBoards: validateHasManyOptional(),
      exactMatch: validateBelongsToOptional(),
      scope: validateBelongsToOptional(),
      kboOrganization: validateBelongsToOptional(),
      isAssociatedWith: validateRequiredWhenClassificationId(
        [
          ...WorshipServiceCodeList,
          ...CentralWorshipServiceCodeList,
          ...ApbCodeList,
        ],
        REQUIRED_MESSAGE
      ),
      hasParticipants: validateRequiredWhenClassificationId(
        IGSCodeList,
        REQUIRED_MESSAGE
      ),
      wasFoundedByOrganizations: Joi.when(
        // Note: For OCMW associations and PEVAs a founding organisation is
        // normally mandatory. But the available business data when onboarding
        // them was incomplete in this respect. Therefore, we opted to relax
        // this rule for the OCMW associations and PEVAs imported during the
        // onboarding. The `relaxMandatoryFoundingOrganization` option allows us
        // to specify that a founding organisation is not mandatory in, for
        // example, the edit core data form. Otherwise, the form validation
        // would prevent editing the core data of the imported organisations due
        // to the lack of founding organisation.
        Joi.ref('$relaxMandatoryFoundingOrganization'),
        {
          is: Joi.exist().valid(true),
          then: validateRequiredWhenClassificationId(
            [...AgbCodeList, ...ApbCodeList],
            REQUIRED_MESSAGE
          ),
          otherwise: validateRequiredWhenClassificationId(
            [
              ...AgbCodeList,
              ...ApbCodeList,
              ...OcmwAssociationCodeList,
              ...PevaMunicipalityCodeList,
              ...PevaProvinceCodeList,
            ],
            REQUIRED_MESSAGE
          ),
        }
      ),
      isSubOrganizationOf: validateRequiredWhenClassificationId(
        [
          ...AgbCodeList,
          ...ApbCodeList,
          ...IGSCodeList,
          ...PoliceZoneCodeList,
          ...AssistanceZoneCodeList,
        ],
        REQUIRED_MESSAGE
      ),
      expectedEndDate: Joi.when('classification.id', {
        is: Joi.exist().valid(...IGSCodeList),
        then: Joi.date()
          .allow(null)
          .min(new Date())
          .messages({ '*': 'De datum mag niet in het verleden liggen' }),
        otherwise: Joi.optional(),
      }),
    });
  }
}
