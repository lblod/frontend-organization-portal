import { attr, hasMany, belongsTo } from '@ember-data/model';
import AgentModel from './agent';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
  validateHasManyOptional,
  validateStringOptional,
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
  WorshipServiceCodeList,
  PevaMunicipalityCodeList,
  PevaProvinceCodeList,
  RepresentativeOrganCodeList,
} from '../constants/Classification';

export default class OrganizationModel extends AgentModel {
  @attr name;
  @attr legalName;
  @attr('string-set') alternativeName; // Note: changing to plural breaks stuff
  @attr('date') expectedEndDate;
  @attr purpose;

  // TODO: this does deviate from our mu-cl-resources configuration where classification is specified on the child levels
  @belongsTo('organization-classification-code', {
    inverse: null,
    async: true,
    polymorphic: true,
  })
  classification;

  @belongsTo('site', {
    inverse: null,
    async: true,
  })
  primarySite;

  @belongsTo('organization-status-code', {
    inverse: null,
    async: true,
  })
  organizationStatus;

  @hasMany('identifier', {
    inverse: null,
    async: true,
  })
  identifiers;

  @hasMany('site', {
    inverse: null,
    async: true,
  })
  sites;

  @hasMany('change-event', {
    inverse: 'originalOrganizations',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  changedBy;

  @hasMany('change-event', {
    inverse: 'resultingOrganizations',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  resultedFrom;

  @hasMany('change-event-result', {
    inverse: 'resultingOrganization',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  changeEventResults;

  @hasMany('post', {
    inverse: null,
    async: true,
  })
  positions;

  @hasMany('organization', {
    inverse: 'isSubOrganizationOf',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  subOrganizations;

  @belongsTo('organization', {
    inverse: 'subOrganizations',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  isSubOrganizationOf;

  @hasMany('organization', {
    inverse: 'isAssociatedWith',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  associatedOrganizations;

  @belongsTo('organization', {
    inverse: 'associatedOrganizations',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  isAssociatedWith;

  @hasMany('organization', {
    inverse: 'wasFoundedByOrganizations',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  foundedOrganizations;

  @hasMany('organization', {
    inverse: 'foundedOrganizations',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  wasFoundedByOrganizations;

  @hasMany('organization', {
    inverse: 'hasParticipants',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  participatesIn;

  @hasMany('organization', {
    inverse: 'participatesIn',
    async: true,
    polymorphic: true,
    as: 'organization',
  })
  hasParticipants;

  @belongsTo('kbo-organization', {
    inverse: 'organization',
    async: true,
    as: 'organization',
  })
  kboOrganization;

  get validationSchema() {
    const REQUIRED_MESSAGE = 'Selecteer een optie';
    return super.validationSchema.append({
      name: validateStringOptional(),
      legalName: Joi.string().empty('').required().messages({
        'any.required': 'Vul de juridische naam in',
      }),
      alternativeName: Joi.array().optional(),
      expectedEndDate: Joi.date().allow(null),
      purpose: validateStringOptional(),
      classification: validateBelongsToRequired(REQUIRED_MESSAGE),
      primarySite: validateBelongsToOptional(),
      organizationStatus: validateBelongsToRequired('Selecteer een optie'),
      identifiers: validateHasManyOptional(),
      sites: validateHasManyOptional(),
      changedBy: validateHasManyOptional(),
      resultedFrom: validateHasManyOptional(),
      changeEventResults: validateHasManyOptional(),
      positions: validateHasManyOptional(),
      subOrganizations: validateHasManyOptional(),
      isSubOrganizationOf: validateBelongsToOptional(),
      associatedOrganizations: validateHasManyOptional(),
      isAssociatedWith: validateBelongsToOptional(),
      foundedOrganizations: validateHasManyOptional(),
      wasFoundedByOrganizations: validateHasManyOptional(),
      participatesIn: validateHasManyOptional(),
      hasParticipants: validateHasManyOptional(),
      kboOrganization: validateBelongsToOptional(),
    });
  }

  // TODO: use registered KBO name as fallback
  get abbName() {
    return this.legalName ?? this.name;
  }

  setAbbName(name) {
    this.name = name;
    this.legalName = name;
  }

  setAlternativeName(names) {
    this.alternativeName = names
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '');
  }

  get isMunicipality() {
    return this.#hasClassificationId(MunicipalityCodeList);
  }

  get isProvince() {
    return this.#hasClassificationId(ProvinceCodeList);
  }

  get isAgb() {
    return this.#hasClassificationId(AgbCodeList);
  }

  get isApb() {
    return this.#hasClassificationId(ApbCodeList);
  }

  get isIgs() {
    return this.#hasClassificationId(IGSCodeList);
  }

  get isPoliceZone() {
    return this.#hasClassificationId(PoliceZoneCodeList);
  }

  get isAssistanceZone() {
    return this.#hasClassificationId(AssistanceZoneCodeList);
  }

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return this.#hasClassificationId(WorshipServiceCodeList);
  }

  get isCentralWorshipService() {
    return this.#hasClassificationId(CentralWorshipServiceCodeList);
  }

  get isOCMW() {
    return this.#hasClassificationId(OCMWCodeList);
  }

  get isOcmwAssociation() {
    return this.#hasClassificationId(OcmwAssociationCodeList);
  }

  get isDistrict() {
    return this.#hasClassificationId(DistrictCodeList);
  }

  get isPevaMunicipality() {
    return this.#hasClassificationId(PevaMunicipalityCodeList);
  }

  get isPevaProvince() {
    return this.#hasClassificationId(PevaProvinceCodeList);
  }

  get isRepresentativeBody() {
    return this.#hasClassificationId(RepresentativeOrganCodeList);
  }

  get hasCentralWorshipService() {
    return false;
  }

  #hasClassificationId(classificationIds) {
    return classificationIds.includes(this.classification?.get('id'));
  }
}
