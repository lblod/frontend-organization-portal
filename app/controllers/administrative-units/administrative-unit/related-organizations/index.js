import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import {
  CLASSIFICATION_CODE,
  OCMW_ASSOCIATION_CLASSIFICATION_CODES,
} from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsIndexController extends Controller {
  queryParams = ['sort', 'page', 'size', 'organizationStatus'];

  @tracked sort = 'name';
  @tracked page = 0;
  size = 25;
  @tracked organizationStatus = true;

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.WORSHIP_SERVICE
    );
  }

  get isCentralWorshipService() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.CENTRAL_WORSHIP_SERVICE
    );
  }

  get isOCMW() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.OCMW
    );
  }

  get isDistrict() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.DISTRICT
    );
  }

  get isMunicipality() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.MUNICIPALITY
    );
  }

  get isProvince() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.PROVINCE
    );
  }

  get isAgb() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.AGB
    );
  }

  get isApb() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.APB
    );
  }

  get isIgs() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
        CLASSIFICATION_CODE.PROJECTVERENIGING ||
      this.model.administrativeUnit.classification?.get('id') ===
        CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING ||
      this.model.administrativeUnit.classification?.get('id') ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING ||
      this.model.administrativeUnit.classification?.get('id') ===
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME
    );
  }

  get isPoliceZone() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.POLICE_ZONE
    );
  }

  get isAssistanceZone() {
    return (
      this.model.administrativeUnit.classification?.get('id') ===
      CLASSIFICATION_CODE.ASSISTANCE_ZONE
    );
  }

  get isOcmwAssociation() {
    return OCMW_ASSOCIATION_CLASSIFICATION_CODES.includes(
      this.model.administrativeUnit.classification?.get('id')
    );
  }
}
