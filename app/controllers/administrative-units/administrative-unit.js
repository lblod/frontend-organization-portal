import Controller from '@ember/controller';
import {
  CLASSIFICATION_CODE,
  OCMW_ASSOCIATION_CLASSIFICATION_CODES,
} from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitController extends Controller {
  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return (
      this.model.classification?.get('id') ===
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }

  get isCentralWorshipService() {
    return (
      this.model.classification?.get('id') ===
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  get isProvince() {
    return (
      this.model.classification?.get('id') === CLASSIFICATION_CODE.PROVINCE
    );
  }

  get isDistrict() {
    return (
      this.model.classification?.get('id') === CLASSIFICATION_CODE.DISTRICT
    );
  }

  get isAgbOrApb() {
    return this.isAgb || this.isApb;
  }

  get isAgb() {
    return this.model.classification?.get('id') === CLASSIFICATION_CODE.AGB;
  }

  get isApb() {
    return this.model.classification?.get('id') === CLASSIFICATION_CODE.APB;
  }

  get isIgs() {
    return (
      this.model.classification?.get('id') ===
        CLASSIFICATION_CODE.PROJECTVERENIGING ||
      this.model.classification?.get('id') ===
        CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING ||
      this.model.classification?.get('id') ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING ||
      this.model.classification?.get('id') ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME
    );
  }

  get isPoliceZone() {
    return (
      this.model.classification?.get('id') === CLASSIFICATION_CODE.POLICE_ZONE
    );
  }

  get isAssistanceZone() {
    return (
      this.model.classification?.get('id') ===
      CLASSIFICATION_CODE.ASSISTANCE_ZONE
    );
  }

  get isOcmwAssociation() {
    return OCMW_ASSOCIATION_CLASSIFICATION_CODES.includes(
      this.model.classification?.get('id')
    );
  }

  get requiresGoverningBodies() {
    return !(
      this.isAgbOrApb ||
      this.isIgs ||
      this.isPoliceZone ||
      this.isAssistanceZone ||
      this.isOcmwAssociation
    );
  }
}
