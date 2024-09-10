import { hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateHasManyNotEmptyRequired,
  validateHasManyOptional,
} from '../validators/schema';
import {
  AgbCodeList,
  ApbCodeList,
  AssistanceZoneCodeList,
  CentralWorshipServiceCodeList,
  DistrictCodeList,
  IGSCodeList,
  MunicipalityCodeList,
  OcmwAssociationCodeList,
  OCMWCodeList,
  PoliceZoneCodeList,
  ProvinceCodeList,
  PevaMunicipalityCodeList,
  PevaProvinceCodeList,
  WorshipServiceCodeList,
  VlaamseGemeenschapscommissieCodeList,
} from '../constants/Classification';
import {
  allowedFoundingMemberships,
  allowedParticipationMemberships,
} from '../constants/memberships';

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
      // Notes:
      // - The requested functionality was to *not* validate memberships of
      //   already existing organizations. When creating a new organization a
      //   mandatory membership is enforced by providing a `true` value for
      //   `creatingNewOrganization`.
      // - More detailed validations concerning, for example, the right
      //   membership role(s) are performed in the membership model.
      memberships: Joi.when(Joi.ref('$creatingNewOrganization'), {
        is: Joi.exist().valid(true),
        then: Joi.when('classification.id', {
          is: Joi.exist().valid(
            ...AgbCodeList,
            ...ApbCodeList,
            ...IGSCodeList,
            ...OcmwAssociationCodeList,
            ...PevaMunicipalityCodeList,
            ...PevaProvinceCodeList,
            ...PoliceZoneCodeList,
            ...AssistanceZoneCodeList,
            ...WorshipServiceCodeList,
            ...CentralWorshipServiceCodeList,
          ),
          then: validateHasManyNotEmptyRequired(REQUIRED_MESSAGE),
          otherwise: validateHasManyOptional(),
        }),
        otherwise: validateHasManyOptional(),
      }),
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

  get isMunicipality() {
    return this._hasClassificationId(MunicipalityCodeList);
  }

  get isProvince() {
    return this._hasClassificationId(ProvinceCodeList);
  }

  get isAgb() {
    return this._hasClassificationId(AgbCodeList);
  }

  get isApb() {
    return this._hasClassificationId(ApbCodeList);
  }

  get isIgs() {
    return this._hasClassificationId(IGSCodeList);
  }

  get isPoliceZone() {
    return this._hasClassificationId(PoliceZoneCodeList);
  }

  get isAssistanceZone() {
    return this._hasClassificationId(AssistanceZoneCodeList);
  }

  get isOCMW() {
    return this._hasClassificationId(OCMWCodeList);
  }

  get isOcmwAssociation() {
    return this._hasClassificationId(OcmwAssociationCodeList);
  }

  get isDistrict() {
    return this._hasClassificationId(DistrictCodeList);
  }

  get isPevaMunicipality() {
    return this._hasClassificationId(PevaMunicipalityCodeList);
  }

  get isPevaProvince() {
    return this._hasClassificationId(PevaProvinceCodeList);
  }

  get isVlaamseGemeenschapscommissie() {
    return this._hasClassificationId(VlaamseGemeenschapscommissieCodeList);
  }

  get isAdministrativeUnit() {
    return true;
  }

  get participantClassifications() {
    return allowedParticipationMemberships
      .filter((e) => e.organizations.includes(this.classification.id))
      .flatMap((e) => e.members);
  }

  get founderClassifications() {
    return allowedFoundingMemberships
      .filter((e) => e.organizations.includes(this.classification.id))
      .flatMap((e) => e.members);
  }

  get requiresGoverningBodies() {
    return !(
      this.isAgb ||
      this.isApb ||
      this.isIgs ||
      this.isPoliceZone ||
      this.isAssistanceZone ||
      this.isOcmwAssociation ||
      this.isPevaMunicipality ||
      this.isPevaProvince ||
      this.isRepresentativeBody ||
      this.isVlaamseGemeenschapscommissie
    );
  }

  get requiresFunctionaries() {
    return !(
      this.isDistrict ||
      this.isWorshipAdministrativeUnit ||
      this.isPoliceZone ||
      this.isAssistanceZone ||
      this.isPevaMunicipality ||
      this.isPevaProvince ||
      this.isRepresentativeBody ||
      this.isVlaamseGemeenschapscommissie
    );
  }
}
