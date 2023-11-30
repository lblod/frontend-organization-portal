import { hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
import { date, object } from 'yup';

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
    return super.validationSchema.shape({
      classification: object().relationship({
        isRequired: true,
        message: 'Selecteer een optie',
      }),
      isAssociatedWith: object().when(
        ['isWorshipAdministrativeUnit', 'isApb'],
        {
          is: (isWorshipAdministrativeUnit, isApb) =>
            isWorshipAdministrativeUnit || isApb,
          then: (schema) =>
            schema.relationship({
              isRequired: true,
              message: 'Selecteer een optie',
            }),
        }
      ),
      // array().when throw "TypeError: cyclic object value".
      // hasParticipants: array().when(['isIGS'], {
      //   is: true,
      //   then: (schema) =>
      //     schema.relationship({
      //       isRequired: true,
      //       message: 'Selecteer een optie',
      //     }),
      // }),
      wasFoundedByOrganization: object().when(['isAgb', 'isApb'], {
        is: (isAgb, isApb) => isAgb || isApb,
        then: (schema) =>
          schema.relationship({
            isRequired: true,
            message: 'Selecteer een optie',
          }),
      }),
      isSubOrganizationOf: object().when(
        ['isAgb', 'isApb', 'isIGS', 'isPoliceZone', 'isAssistanceZone'],
        {
          is: (isAgb, isApb, isIGS, isPoliceZone, isAssistanceZone) =>
            isAgb || isApb || isIGS || isPoliceZone || isAssistanceZone,
          then: (schema) =>
            schema.relationship({
              isRequired: true,
              message: 'Selecteer een optie',
            }),
        }
      ),
      expectedEndDate: date().when('isIGS', {
        is: true,
        then: (schema) =>
          schema.min(new Date(), 'De datum mag niet in het verleden liggen'),
      }),
    });
  }

  get isMunicipality() {
    return this.hasClassificationId(CLASSIFICATION_CODE.MUNICIPALITY);
  }

  get isProvince() {
    return this.hasClassificationId(CLASSIFICATION_CODE.PROVINCE);
  }

  get isAgb() {
    return this.hasClassificationId(CLASSIFICATION_CODE.AGB);
  }

  get isApb() {
    return this.hasClassificationId(CLASSIFICATION_CODE.APB);
  }

  get isIGS() {
    return this.hasClassificationId([
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
    ]);
  }

  get isPoliceZone() {
    return this.hasClassificationId(CLASSIFICATION_CODE.POLICE_ZONE);
  }

  get isAssistanceZone() {
    return this.hasClassificationId(CLASSIFICATION_CODE.ASSISTANCE_ZONE);
  }

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return this.hasClassificationId(CLASSIFICATION_CODE.WORSHIP_SERVICE);
  }

  get isCentralWorshipService() {
    return this.hasClassificationId(
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  get isOCMW() {
    return this.hasClassificationId(CLASSIFICATION_CODE.OCMW);
  }

  get isDistrict() {
    return this.hasClassificationId(CLASSIFICATION_CODE.DISTRICT);
  }

  hasClassificationId(classificationId) {
    if (Array.isArray(classificationId)) {
      return classificationId.includes(this.classification?.get('id'));
    } else {
      return this.classification?.get('id') === classificationId;
    }
  }
}
