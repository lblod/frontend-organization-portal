import { hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';
import Joi from 'joi';
import {
  belongToOptional,
  belongToRequired,
  hasManyOptional,
  requiredWhenClassificationId,
} from '../validators/schema';
import {
  AgbCodeList,
  ApbCodeList,
  AssistanceZoneCodeList,
  CentralWorshipServiceCodeList,
  DistrictCodeList,
  IGSCodeList,
  MunicipalityCodeList,
  OCMWCodeList,
  PoliceZoneCodeList,
  ProvinceCodeList,
  WorshipServiceCodeList,
} from '../constants/Classification';

export default class AdministrativeUnitModel extends OrganizationModel {
  @belongsTo('administrative-unit-classification-code', {
    inverse: null,
  })
  classification;

  @belongsTo('location', {
    inverse: 'administrativeUnits',
  })
  locatedWithin;

  @hasMany('governing-body', {
    inverse: 'administrativeUnit',
  })
  governingBodies;

  @hasMany('local-involvement', {
    inverse: 'administrativeUnit',
  })
  involvedBoards;

  @belongsTo('concept', {
    inverse: null,
  })
  exactMatch;

  @belongsTo('location', {
    inverse: null,
  })
  scope;

  get validationSchema() {
    return super.validationSchema.append({
      classification: belongToRequired('Selecteer een optie'),
      'located-within': belongToOptional(),
      'governing-bodies': hasManyOptional(),
      'involved-boards': hasManyOptional(),
      'exact-match': belongToOptional(),
      scope: belongToOptional(),
      'is-associated-with': requiredWhenClassificationId([
        ...WorshipServiceCodeList,
        ...CentralWorshipServiceCodeList,
      ]),
      'has-participants': requiredWhenClassificationId(IGSCodeList),
      'was-founded-by-organization': requiredWhenClassificationId([
        ...AgbCodeList,
        ...ApbCodeList,
      ]),
      'is-sub-organization-of': requiredWhenClassificationId([
        ...AgbCodeList,
        ...ApbCodeList,
        ...IGSCodeList,
        ...PoliceZoneCodeList,
        ...AssistanceZoneCodeList,
        ...WorshipServiceCodeList,
        ...CentralWorshipServiceCodeList,
      ]),
      'expected-end-date': Joi.when('classification.id', {
        is: Joi.exist().valid(...IGSCodeList),
        then: Joi.date()
          .min(new Date())
          .messages({ '*': 'De datum mag niet in het verleden liggen' }),
        otherwise: Joi.optional(),
      }),
    });
  }

  get isMunicipality() {
    return this.hasClassificationId(MunicipalityCodeList);
  }

  get isProvince() {
    return this.hasClassificationId(ProvinceCodeList);
  }

  get isAgb() {
    return this.hasClassificationId(AgbCodeList);
  }

  get isApb() {
    return this.hasClassificationId(ApbCodeList);
  }

  get isIGS() {
    return this.hasClassificationId(IGSCodeList);
  }

  get isPoliceZone() {
    return this.hasClassificationId(PoliceZoneCodeList);
  }

  get isAssistanceZone() {
    return this.hasClassificationId(AssistanceZoneCodeList);
  }

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return this.hasClassificationId(WorshipServiceCodeList);
  }

  get isCentralWorshipService() {
    return this.hasClassificationId(CentralWorshipServiceCodeList);
  }

  get isOCMW() {
    return this.hasClassificationId(OCMWCodeList);
  }

  get isDistrict() {
    return this.hasClassificationId(DistrictCodeList);
  }

  hasClassificationId(classificationId) {
    if (Array.isArray(classificationId)) {
      return classificationId.includes(this.classification?.get('id'));
    } else {
      return this.classification?.get('id') === classificationId;
    }
  }
}
